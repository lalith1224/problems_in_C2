import {
  users,
  patients,
  doctors,
  pharmacies,
  appointments,
  prescriptions,
  inventory,
  aiConversations,
  type User,
  type UpsertUser,
  type Patient,
  type InsertPatient,
  type Doctor,
  type InsertDoctor,
  type Pharmacy,
  type InsertPharmacy,
  type Appointment,
  type InsertAppointment,
  type Prescription,
  type InsertPrescription,
  type InventoryItem,
  type InsertInventoryItem,
  type AIConversation,
  type InsertAIConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, lt, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;

  // Patient operations
  createPatient(patientData: InsertPatient): Promise<Patient>;
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientByUserId(userId: string): Promise<Patient | undefined>;
  updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient>;

  // Doctor operations
  createDoctor(doctorData: InsertDoctor): Promise<Doctor>;
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctorByUserId(userId: string): Promise<Doctor | undefined>;
  updateDoctor(id: string, updates: Partial<InsertDoctor>): Promise<Doctor>;
  getAllDoctors(): Promise<Doctor[]>;

  // Pharmacy operations
  createPharmacy(pharmacyData: InsertPharmacy): Promise<Pharmacy>;
  getPharmacy(id: string): Promise<Pharmacy | undefined>;
  getPharmacyByUserId(userId: string): Promise<Pharmacy | undefined>;
  updatePharmacy(id: string, updates: Partial<InsertPharmacy>): Promise<Pharmacy>;
  getAllPharmacies(): Promise<Pharmacy[]>;

  // Appointment operations
  createAppointment(appointmentData: InsertAppointment): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getPatientAppointments(patientId: string): Promise<Appointment[]>;
  getDoctorAppointments(doctorId: string): Promise<Appointment[]>;
  updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment>;

  // Prescription operations
  createPrescription(prescriptionData: InsertPrescription): Promise<Prescription>;
  getPrescription(id: string): Promise<Prescription | undefined>;
  getPatientPrescriptions(patientId: string): Promise<Prescription[]>;
  getDoctorPrescriptions(doctorId: string): Promise<Prescription[]>;
  getPharmacyPrescriptions(pharmacyId: string): Promise<Prescription[]>;
  updatePrescription(id: string, updates: Partial<InsertPrescription>): Promise<Prescription>;

  // Inventory operations
  createInventoryItem(itemData: InsertInventoryItem): Promise<InventoryItem>;
  getPharmacyInventory(pharmacyId: string): Promise<InventoryItem[]>;
  updateInventoryItem(id: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  getLowStockItems(pharmacyId: string): Promise<InventoryItem[]>;
  getExpiringItems(pharmacyId: string, days: number): Promise<InventoryItem[]>;

  // AI Conversation operations
  createAIConversation(conversationData: InsertAIConversation): Promise<AIConversation>;
  getUserAIConversations(userId: string): Promise<AIConversation[]>;
  updateAIConversation(id: string, updates: Partial<InsertAIConversation>): Promise<AIConversation>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Patient operations
  async createPatient(patientData: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(patientData)
      .returning();
    return patient;
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async getPatientByUserId(userId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.userId, userId));
    return patient;
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient> {
    const [patient] = await db
      .update(patients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return patient;
  }

  // Doctor operations
  async createDoctor(doctorData: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db
      .insert(doctors)
      .values(doctorData)
      .returning();
    return doctor;
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor;
  }

  async getDoctorByUserId(userId: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.userId, userId));
    return doctor;
  }

  async updateDoctor(id: string, updates: Partial<InsertDoctor>): Promise<Doctor> {
    const [doctor] = await db
      .update(doctors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(doctors.id, id))
      .returning();
    return doctor;
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors).orderBy(asc(doctors.specialization));
  }

  // Pharmacy operations
  async createPharmacy(pharmacyData: InsertPharmacy): Promise<Pharmacy> {
    const [pharmacy] = await db
      .insert(pharmacies)
      .values(pharmacyData)
      .returning();
    return pharmacy;
  }

  async getPharmacy(id: string): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.id, id));
    return pharmacy;
  }

  async getPharmacyByUserId(userId: string): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.userId, userId));
    return pharmacy;
  }

  async updatePharmacy(id: string, updates: Partial<InsertPharmacy>): Promise<Pharmacy> {
    const [pharmacy] = await db
      .update(pharmacies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pharmacies.id, id))
      .returning();
    return pharmacy;
  }

  async getAllPharmacies(): Promise<Pharmacy[]> {
    return await db.select().from(pharmacies).orderBy(asc(pharmacies.pharmacyName));
  }

  // Appointment operations
  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();
    return appointment;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId))
      .orderBy(asc(appointments.appointmentDate));
  }

  async updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  // Prescription operations
  async createPrescription(prescriptionData: InsertPrescription): Promise<Prescription> {
    const [prescription] = await db
      .insert(prescriptions)
      .values(prescriptionData)
      .returning();
    return prescription;
  }

  async getPrescription(id: string): Promise<Prescription | undefined> {
    const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
    return prescription;
  }

  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt));
  }

  async getDoctorPrescriptions(doctorId: string): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(desc(prescriptions.createdAt));
  }

  async getPharmacyPrescriptions(pharmacyId: string): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(and(
        eq(prescriptions.pharmacyId, pharmacyId),
        or(eq(prescriptions.status, "pending"), eq(prescriptions.status, "approved"))
      ))
      .orderBy(desc(prescriptions.createdAt));
  }

  async updatePrescription(id: string, updates: Partial<InsertPrescription>): Promise<Prescription> {
    const [prescription] = await db
      .update(prescriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prescriptions.id, id))
      .returning();
    return prescription;
  }

  // Inventory operations
  async createInventoryItem(itemData: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db
      .insert(inventory)
      .values(itemData)
      .returning();
    return item;
  }

  async getPharmacyInventory(pharmacyId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventory)
      .where(eq(inventory.pharmacyId, pharmacyId))
      .orderBy(asc(inventory.medicineName));
  }

  async updateInventoryItem(id: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const [item] = await db
      .update(inventory)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }

  async getLowStockItems(pharmacyId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventory)
      .where(and(
        eq(inventory.pharmacyId, pharmacyId),
        lt(inventory.currentStock, inventory.minStockLevel)
      ))
      .orderBy(asc(inventory.currentStock));
  }

  async getExpiringItems(pharmacyId: string, days: number): Promise<InventoryItem[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    return await db
      .select()
      .from(inventory)
      .where(and(
        eq(inventory.pharmacyId, pharmacyId),
        lt(inventory.expiryDate, expiryDate.toISOString().split('T')[0])
      ))
      .orderBy(asc(inventory.expiryDate));
  }

  // AI Conversation operations
  async createAIConversation(conversationData: InsertAIConversation): Promise<AIConversation> {
    const [conversation] = await db
      .insert(aiConversations)
      .values(conversationData)
      .returning();
    return conversation;
  }

  async getUserAIConversations(userId: string): Promise<AIConversation[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.updatedAt))
      .limit(10);
  }

  async updateAIConversation(id: string, updates: Partial<InsertAIConversation>): Promise<AIConversation> {
    const [conversation] = await db
      .update(aiConversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiConversations.id, id))
      .returning();
    return conversation;
  }
}

export const storage = new DatabaseStorage();
