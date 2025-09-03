import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { z } from "zod";
import { registerUserSchema } from "@shared/schema";
import { openRouterService } from "./services/openrouter";

export async function registerRoutes(app: Express): Promise<Server> {
  // Registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        passwordHash,
      });

      // Create role-specific profile
      if (validatedData.role === 'patient') {
        await storage.createPatient({
          userId: user.id,
          dateOfBirth: validatedData.dateOfBirth,
          gender: validatedData.gender,
          phone: validatedData.phone,
        });
      } else if (validatedData.role === 'doctor') {
        if (!validatedData.licenseNumber || !validatedData.specialization) {
          return res.status(400).json({ message: "License number and specialization required for doctors" });
        }
        await storage.createDoctor({
          userId: user.id,
          licenseNumber: validatedData.licenseNumber,
          specialization: validatedData.specialization,
          experience: validatedData.experience || 0,
        });
      } else if (validatedData.role === 'pharmacy') {
        if (!validatedData.pharmacyName || !validatedData.licenseNumber || !validatedData.address) {
          return res.status(400).json({ message: "Pharmacy name, license number, and address required for pharmacies" });
        }
        await storage.createPharmacy({
          userId: user.id,
          pharmacyName: validatedData.pharmacyName,
          licenseNumber: validatedData.licenseNumber,
          address: validatedData.address,
          phone: validatedData.phone || '',
          operatingHours: validatedData.operatingHours,
        });
      }

      const { passwordHash: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set up session
      (req.session as any).userId = user.id;
      (req.session as any).userRole = user.role;

      const { passwordHash: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Get role-specific data
      let roleData = null;
      if (user.role === 'patient') {
        roleData = await storage.getPatientByUserId(user.id);
      } else if (user.role === 'doctor') {
        roleData = await storage.getDoctorByUserId(user.id);
      } else if (user.role === 'pharmacy') {
        roleData = await storage.getPharmacyByUserId(user.id);
      }

      const { passwordHash: _, ...safeUser } = user;
      res.json({ user: safeUser, profile: roleData });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.userId = userId;
    req.userRole = req.session.userRole;
    next();
  };

  // Patient routes
  app.get("/api/patient/dashboard", requireAuth, async (req: any, res) => {
    try {
      if (req.userRole !== 'patient') {
        return res.status(403).json({ message: "Access denied" });
      }

      const patient = await storage.getPatientByUserId(req.userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      const appointments = await storage.getPatientAppointments(patient.id);
      const prescriptions = await storage.getPatientPrescriptions(patient.id);

      res.json({
        patient,
        appointments: appointments.slice(0, 5), // Recent appointments
        prescriptions: prescriptions.slice(0, 3), // Active prescriptions
        stats: {
          nextAppointment: appointments.find(a => a.status === 'scheduled'),
          activePrescriptions: prescriptions.filter(p => p.status === 'approved').length,
          healthScore: patient.healthScore || 85,
        }
      });
    } catch (error) {
      console.error("Patient dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard" });
    }
  });

  app.get("/api/doctors", requireAuth, async (req, res) => {
    try {
      const doctors = await storage.getAllDoctors();
      res.json(doctors);
    } catch (error) {
      console.error("Get doctors error:", error);
      res.status(500).json({ message: "Failed to get doctors" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req: any, res) => {
    try {
      if (req.userRole !== 'patient') {
        return res.status(403).json({ message: "Only patients can book appointments" });
      }

      const patient = await storage.getPatientByUserId(req.userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      const appointmentData = {
        patientId: patient.id,
        doctorId: req.body.doctorId,
        appointmentDate: new Date(req.body.appointmentDate),
        appointmentType: req.body.appointmentType,
        reason: req.body.reason,
        status: 'scheduled',
      };

      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ message: "Failed to book appointment" });
    }
  });

  // Doctor routes
  app.get("/api/doctor/dashboard", requireAuth, async (req: any, res) => {
    try {
      if (req.userRole !== 'doctor') {
        return res.status(403).json({ message: "Access denied" });
      }

      const doctor = await storage.getDoctorByUserId(req.userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      const appointments = await storage.getDoctorAppointments(doctor.id);
      const prescriptions = await storage.getDoctorPrescriptions(doctor.id);

      // Get today's appointments
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= todayStart && aptDate < todayEnd;
      });

      res.json({
        doctor,
        todayAppointments,
        appointments: appointments.slice(0, 10),
        prescriptions: prescriptions.slice(0, 5),
        stats: {
          todayPatients: todayAppointments.length,
          pendingReviews: appointments.filter(a => a.status === 'completed' && !a.diagnosis).length,
          totalPrescriptions: prescriptions.length,
          aiInsights: 5, // Placeholder for AI insights count
        }
      });
    } catch (error) {
      console.error("Doctor dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard" });
    }
  });

  app.post("/api/prescriptions", requireAuth, async (req: any, res) => {
    try {
      if (req.userRole !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can create prescriptions" });
      }

      const doctor = await storage.getDoctorByUserId(req.userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      const prescriptionData = {
        doctorId: doctor.id,
        patientId: req.body.patientId,
        appointmentId: req.body.appointmentId,
        pharmacyId: req.body.pharmacyId,
        medications: req.body.medications,
        instructions: req.body.instructions,
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
        status: 'pending',
      };

      const prescription = await storage.createPrescription(prescriptionData);
      res.json(prescription);
    } catch (error) {
      console.error("Create prescription error:", error);
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });

  // Pharmacy routes
  app.get("/api/pharmacy/dashboard", requireAuth, async (req: any, res) => {
    try {
      if (req.userRole !== 'pharmacy') {
        return res.status(403).json({ message: "Access denied" });
      }

      const pharmacy = await storage.getPharmacyByUserId(req.userId);
      if (!pharmacy) {
        return res.status(404).json({ message: "Pharmacy profile not found" });
      }

      const prescriptions = await storage.getPharmacyPrescriptions(pharmacy.id);
      const inventory = await storage.getPharmacyInventory(pharmacy.id);
      const lowStockItems = await storage.getLowStockItems(pharmacy.id);
      const expiringItems = await storage.getExpiringItems(pharmacy.id, 30);

      res.json({
        pharmacy,
        newPrescriptions: prescriptions.filter(p => p.status === 'pending').slice(0, 5),
        inventory: inventory.slice(0, 10),
        lowStockItems: lowStockItems.slice(0, 5),
        expiringItems: expiringItems.slice(0, 5),
        stats: {
          pendingOrders: prescriptions.filter(p => p.status === 'pending').length,
          lowStockCount: lowStockItems.length,
          todayRevenue: 2340, // This would come from actual transactions
          aiRecommendations: 3,
        }
      });
    } catch (error) {
      console.error("Pharmacy dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard" });
    }
  });

  app.put("/api/prescriptions/:id/status", requireAuth, async (req: any, res) => {
    try {
      if (req.userRole !== 'pharmacy') {
        return res.status(403).json({ message: "Only pharmacies can update prescription status" });
      }

      const { id } = req.params;
      const { status } = req.body;

      const prescription = await storage.updatePrescription(id, { status });
      res.json(prescription);
    } catch (error) {
      console.error("Update prescription status error:", error);
      res.status(500).json({ message: "Failed to update prescription status" });
    }
  });

  app.post("/api/inventory", requireAuth, async (req: any, res) => {
    try {
      if (req.userRole !== 'pharmacy') {
        return res.status(403).json({ message: "Only pharmacies can manage inventory" });
      }

      const pharmacy = await storage.getPharmacyByUserId(req.userId);
      if (!pharmacy) {
        return res.status(404).json({ message: "Pharmacy profile not found" });
      }

      const itemData = {
        ...req.body,
        pharmacyId: pharmacy.id,
      };

      const item = await storage.createInventoryItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Create inventory item error:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  // AI Assistant routes
  app.post("/api/ai/chat", requireAuth, async (req: any, res) => {
    try {
      const { message, context } = req.body;
      const userId = req.userId;
      const userRole = req.userRole;

      // Get or create conversation
      const conversations = await storage.getUserAIConversations(userId);
      let conversationId = conversations[0]?.id;

      if (!conversationId) {
        const newConversation = await storage.createAIConversation({
          userId,
          userRole,
          messages: [],
        });
        conversationId = newConversation.id;
      }

      // Get AI response
      const aiResponse = await openRouterService.getChatResponse(message, userRole, context);

      // Update conversation with new messages
      const conversation = conversations[0] || await storage.getUserAIConversations(userId).then(c => c[0]);
      const updatedMessages = [
        ...(conversation.messages as any[]),
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: aiResponse, timestamp: new Date() }
      ];

      await storage.updateAIConversation(conversationId, {
        messages: updatedMessages,
        context,
      });

      res.json({ response: aiResponse });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "AI service temporarily unavailable" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
