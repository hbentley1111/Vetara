import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").notNull().default("pet_owner"), // pet_owner, veterinarian, groomer, trainer
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pets table
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  breed: varchar("breed").notNull(),
  species: varchar("species").notNull(), // dog, cat, bird, etc.
  dateOfBirth: timestamp("date_of_birth"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  color: varchar("color"),
  microchipId: varchar("microchip_id"),
  photoUrl: varchar("photo_url"),
  qrCodeUrl: varchar("qr_code_url"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medical records table
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").references(() => users.id),
  recordType: varchar("record_type").notNull(), // vaccination, checkup, surgery, lab_results, etc.
  title: varchar("title").notNull(),
  description: text("description"),
  visitDate: timestamp("visit_date").notNull(),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  medications: text("medications"),
  followUpDate: timestamp("follow_up_date"),
  attachments: text("attachments").array(), // URLs to uploaded files
  cost: decimal("cost", { precision: 8, scale: 2 }),
  isEmergency: boolean("is_emergency").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service providers table (extends users)
export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: varchar("business_name").notNull(),
  licenseNumber: varchar("license_number"),
  specialties: text("specialties").array(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  phone: varchar("phone"),
  website: varchar("website"),
  description: text("description"),
  isVerified: boolean("is_verified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  petId: integer("pet_id").references(() => pets.id),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title"),
  comment: text("comment"),
  serviceDate: timestamp("service_date"),
  isRecommended: boolean("is_recommended").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  appointmentType: varchar("appointment_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").default(60), // minutes
  status: varchar("status").notNull().default("scheduled"), // scheduled, confirmed, completed, cancelled
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shared records table for tracking record sharing
export const sharedRecords = pgTable("shared_records", {
  id: serial("id").primaryKey(),
  recordId: integer("record_id").notNull().references(() => medicalRecords.id, { onDelete: "cascade" }),
  sharedWithId: varchar("shared_with_id").notNull().references(() => users.id),
  sharedById: varchar("shared_by_id").notNull().references(() => users.id),
  accessLevel: varchar("access_level").notNull().default("read"), // read, write
  expiresAt: timestamp("expires_at"),
  isRevoked: boolean("is_revoked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  pets: many(pets),
  reviews: many(reviews),
  sharedRecords: many(sharedRecords),
}));

export const petRelations = relations(pets, ({ one, many }) => ({
  owner: one(users, {
    fields: [pets.ownerId],
    references: [users.id],
  }),
  medicalRecords: many(medicalRecords),
  appointments: many(appointments),
}));

export const medicalRecordRelations = relations(medicalRecords, ({ one, many }) => ({
  pet: one(pets, {
    fields: [medicalRecords.petId],
    references: [pets.id],
  }),
  provider: one(users, {
    fields: [medicalRecords.providerId],
    references: [users.id],
  }),
  sharedRecords: many(sharedRecords),
}));

export const serviceProviderRelations = relations(serviceProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
  appointments: many(appointments),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  provider: one(serviceProviders, {
    fields: [reviews.providerId],
    references: [serviceProviders.id],
  }),
  pet: one(pets, {
    fields: [reviews.petId],
    references: [pets.id],
  }),
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
  pet: one(pets, {
    fields: [appointments.petId],
    references: [pets.id],
  }),
  provider: one(serviceProviders, {
    fields: [appointments.providerId],
    references: [serviceProviders.id],
  }),
}));

export const sharedRecordRelations = relations(sharedRecords, ({ one }) => ({
  record: one(medicalRecords, {
    fields: [sharedRecords.recordId],
    references: [medicalRecords.id],
  }),
  sharedWith: one(users, {
    fields: [sharedRecords.sharedWithId],
    references: [users.id],
  }),
  sharedBy: one(users, {
    fields: [sharedRecords.sharedById],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSharedRecordSchema = createInsertSchema(sharedRecords).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertSharedRecord = z.infer<typeof insertSharedRecordSchema>;
export type SharedRecord = typeof sharedRecords.$inferSelect;
