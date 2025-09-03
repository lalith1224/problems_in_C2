import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull(), // 'patient', 'doctor', 'pharmacy'
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patient-specific data
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender"),
  phone: varchar("phone"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  currentMedications: text("current_medications"),
  healthScore: integer("health_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Doctor-specific data
export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  licenseNumber: varchar("license_number").notNull(),
  specialization: varchar("specialization").notNull(),
  experience: integer("experience"),
  education: text("education"),
  certifications: text("certifications"),
  hospitalAffiliations: text("hospital_affiliations"),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  availableSlots: jsonb("available_slots"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pharmacy-specific data
export const pharmacies = pgTable("pharmacies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  pharmacyName: varchar("pharmacy_name").notNull(),
  licenseNumber: varchar("license_number").notNull(),
  address: text("address").notNull(),
  phone: varchar("phone").notNull(),
  operatingHours: jsonb("operating_hours"),
  servicesOffered: text("services_offered"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  appointmentType: varchar("appointment_type").notNull(), // 'video', 'in-person'
  status: varchar("status").default("scheduled"), // 'scheduled', 'confirmed', 'completed', 'cancelled'
  reason: text("reason"),
  notes: text("notes"),
  diagnosis: text("diagnosis"),
  treatmentPlan: text("treatment_plan"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prescriptions
export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  pharmacyId: varchar("pharmacy_id").references(() => pharmacies.id),
  medications: jsonb("medications").notNull(), // Array of medication objects
  instructions: text("instructions"),
  status: varchar("status").default("pending"), // 'pending', 'approved', 'dispensed', 'completed'
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pharmacy inventory
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pharmacyId: varchar("pharmacy_id").references(() => pharmacies.id).notNull(),
  medicineName: varchar("medicine_name").notNull(),
  genericName: varchar("generic_name"),
  manufacturer: varchar("manufacturer"),
  dosage: varchar("dosage"),
  form: varchar("form"), // 'tablet', 'capsule', 'syrup', etc.
  currentStock: integer("current_stock").default(0),
  minStockLevel: integer("min_stock_level").default(10),
  price: decimal("price", { precision: 10, scale: 2 }),
  expiryDate: date("expiry_date"),
  batchNumber: varchar("batch_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Assistant conversations
export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  userRole: varchar("user_role").notNull(),
  messages: jsonb("messages").notNull(), // Array of message objects
  context: text("context"), // Additional context for AI
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  patient: one(patients, { fields: [users.id], references: [patients.userId] }),
  doctor: one(doctors, { fields: [users.id], references: [doctors.userId] }),
  pharmacy: one(pharmacies, { fields: [users.id], references: [pharmacies.userId] }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
}));

export const pharmaciesRelations = relations(pharmacies, ({ one, many }) => ({
  user: one(users, { fields: [pharmacies.userId], references: [users.id] }),
  inventory: many(inventory),
  prescriptions: many(prescriptions),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(patients, { fields: [prescriptions.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [prescriptions.doctorId], references: [doctors.id] }),
  pharmacy: one(pharmacies, { fields: [prescriptions.pharmacyId], references: [pharmacies.id] }),
  appointment: one(appointments, { fields: [prescriptions.appointmentId], references: [appointments.id] }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  pharmacy: one(pharmacies, { fields: [inventory.pharmacyId], references: [pharmacies.id] }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;
export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacy = typeof pharmacies.$inferInsert;
export const insertPharmacySchema = createInsertSchema(pharmacies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = typeof prescriptions.$inferInsert;
export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = typeof inventory.$inferInsert;
export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = typeof aiConversations.$inferInsert;
export const insertAIConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Registration schemas
export const registerUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['patient', 'doctor', 'pharmacy']),
  // Patient-specific fields
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  // Doctor-specific fields
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.number().optional(),
  // Pharmacy-specific fields
  pharmacyName: z.string().optional(),
  address: z.string().optional(),
  operatingHours: z.any().optional(),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
