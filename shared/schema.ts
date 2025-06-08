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
  subscriptionStatus: varchar("subscription_status").default("inactive"), // active, inactive, trial
  subscriptionTier: varchar("subscription_tier").default("basic"), // basic, pro, enterprise
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  monthlyAccessFee: decimal("monthly_access_fee", { precision: 10, scale: 2 }).default("29.99"),
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
  googlePlaceId: varchar("google_place_id"),
  googleRating: decimal("google_rating", { precision: 3, scale: 2 }),
  googleReviewCount: integer("google_review_count"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
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

// Provider access permissions table
export const providerAccess = pgTable("provider_access", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessLevel: varchar("access_level").default("read"), // read, write, emergency
  isActive: boolean("is_active").default(true),
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  accessReason: text("access_reason"), // "routine_checkup", "emergency", "consultation"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider subscriptions table
export const providerSubscriptions = pgTable("provider_subscriptions", {
  id: serial("id").primaryKey(),
  providerId: varchar("provider_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionTier: varchar("subscription_tier").notNull(), // basic, pro, enterprise
  status: varchar("status").default("active"), // active, inactive, suspended, trial
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).notNull(),
  petsAccessLimit: integer("pets_access_limit").default(50), // number of pets they can access
  currentPetsAccessed: integer("current_pets_accessed").default(0),
  billingCycle: varchar("billing_cycle").default("monthly"), // monthly, yearly
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  lastBilledAt: timestamp("last_billed_at"),
  nextBillingDate: timestamp("next_billing_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insurance partners table
export const insurancePartners = pgTable("insurance_partners", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name").notNull(),
  partnerCode: varchar("partner_code").unique().notNull(),
  logoUrl: varchar("logo_url"),
  description: text("description"),
  websiteUrl: varchar("website_url"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  isActive: boolean("is_active").default(true),
  baseDiscountRate: decimal("base_discount_rate", { precision: 5, scale: 2 }).default("5.00"), // 5% base discount
  maxDiscountRate: decimal("max_discount_rate", { precision: 5, scale: 2 }).default("25.00"), // 25% max discount
  apiEndpoint: varchar("api_endpoint"), // for discount verification API
  apiKey: varchar("api_key"), // encrypted API key for partner
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("3.00"), // 3% commission from insurance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pet insurance policies table
export const petInsurancePolicies = pgTable("pet_insurance_policies", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  insurancePartnerId: integer("insurance_partner_id").notNull().references(() => insurancePartners.id),
  policyNumber: varchar("policy_number").notNull(),
  policyType: varchar("policy_type").notNull(), // basic, comprehensive, premium
  premiumAmount: decimal("premium_amount", { precision: 10, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0.00"),
  discountedPremium: decimal("discounted_premium", { precision: 10, scale: 2 }),
  coverageStartDate: timestamp("coverage_start_date").notNull(),
  coverageEndDate: timestamp("coverage_end_date").notNull(),
  status: varchar("status").default("active"), // active, expired, cancelled
  lastHealthScoreUpdate: timestamp("last_health_score_update"),
  currentHealthScore: integer("current_health_score").default(0), // 0-100 health score
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health score tracking table
export const healthScoreHistory = pgTable("health_score_history", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  policyId: integer("policy_id").references(() => petInsurancePolicies.id, { onDelete: "cascade" }),
  score: integer("score").notNull(), // 0-100 health score
  previousScore: integer("previous_score"),
  scoreChange: integer("score_change"), // difference from previous score
  calculationFactors: jsonb("calculation_factors"), // factors that contributed to score
  discountEarned: decimal("discount_earned", { precision: 5, scale: 2 }).default("0.00"),
  recordDate: timestamp("record_date").defaultNow(),
  nextEvaluation: timestamp("next_evaluation"), // when next score calculation is due
  createdAt: timestamp("created_at").defaultNow(),
});

// Insurance claims integration table
export const insuranceClaims = pgTable("insurance_claims", {
  id: serial("id").primaryKey(),
  policyId: integer("policy_id").notNull().references(() => petInsurancePolicies.id, { onDelete: "cascade" }),
  medicalRecordId: integer("medical_record_id").references(() => medicalRecords.id),
  claimNumber: varchar("claim_number").unique().notNull(),
  claimAmount: decimal("claim_amount", { precision: 10, scale: 2 }).notNull(),
  claimType: varchar("claim_type").notNull(), // routine, emergency, surgery, medication
  claimStatus: varchar("claim_status").default("submitted"), // submitted, approved, denied, processing
  submittedDate: timestamp("submitted_date").defaultNow(),
  processedDate: timestamp("processed_date"),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }),
  denialReason: text("denial_reason"),
  platformCommission: decimal("platform_commission", { precision: 10, scale: 2 }), // our commission from insurance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider quality metrics table (similar to Healthgrades)
export const providerQualityMetrics = pgTable("provider_quality_metrics", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  
  // Overall ratings
  overallRating: decimal("overall_rating", { precision: 3, scale: 2 }).default("0.00"), // 0.00 to 5.00
  totalPatients: integer("total_patients").default(0),
  totalProcedures: integer("total_procedures").default(0),
  yearsOfExperience: integer("years_of_experience").default(0),
  
  // Quality scores (0-100)
  clinicalQualityScore: integer("clinical_quality_score").default(0),
  patientSafetyScore: integer("patient_safety_score").default(0),
  patientExperienceScore: integer("patient_experience_score").default(0),
  timeliness: integer("timeliness").default(0),
  effectiveness: integer("effectiveness").default(0),
  
  // Treatment outcome metrics
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
  complicationRate: decimal("complication_rate", { precision: 5, scale: 2 }).default("0.00"),
  readmissionRate: decimal("readmission_rate", { precision: 5, scale: 2 }).default("0.00"),
  emergencyResponseTime: integer("emergency_response_time").default(0), // minutes
  averageAppointmentWaitTime: integer("average_appointment_wait_time").default(0), // minutes
  
  // Patient satisfaction metrics
  communicationRating: decimal("communication_rating", { precision: 3, scale: 2 }).default("0.00"),
  compassionRating: decimal("compassion_rating", { precision: 3, scale: 2 }).default("0.00"),
  professionalismRating: decimal("professionalism_rating", { precision: 3, scale: 2 }).default("0.00"),
  recommendationRate: decimal("recommendation_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
  
  // Certifications and credentials
  boardCertifications: text("board_certifications").array(),
  specialtyCertifications: text("specialty_certifications").array(),
  continuingEducationHours: integer("continuing_education_hours").default(0),
  lastCertificationUpdate: timestamp("last_certification_update"),
  
  // Cost metrics
  averageCostRating: decimal("average_cost_rating", { precision: 3, scale: 2 }).default("0.00"), // 1-5 scale
  insuranceAcceptanceRate: decimal("insurance_acceptance_rate", { precision: 5, scale: 2 }).default("0.00"),
  
  // Accessibility
  wheelchairAccessible: boolean("wheelchair_accessible").default(false),
  emergencyServices: boolean("emergency_services").default(false),
  telemedicineAvailable: boolean("telemedicine_available").default(false),
  
  // Calculation metadata
  lastCalculated: timestamp("last_calculated").defaultNow(),
  calculationPeriod: varchar("calculation_period").default("12_months"), // time period for metrics
  dataPoints: integer("data_points").default(0), // number of reviews/records used
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider performance tracking table
export const providerPerformanceHistory = pgTable("provider_performance_history", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  metricType: varchar("metric_type").notNull(), // clinical_quality, patient_safety, etc.
  metricValue: decimal("metric_value", { precision: 10, scale: 4 }).notNull(),
  previousValue: decimal("previous_value", { precision: 10, scale: 4 }),
  changePercentage: decimal("change_percentage", { precision: 6, scale: 2 }),
  trendDirection: varchar("trend_direction"), // improving, declining, stable
  recordDate: timestamp("record_date").defaultNow(),
  reportingPeriod: varchar("reporting_period").notNull(), // monthly, quarterly, yearly
  dataSource: varchar("data_source").notNull(), // reviews, outcomes, surveys
  createdAt: timestamp("created_at").defaultNow(),
});

// Provider awards and recognitions table
export const providerRecognitions = pgTable("provider_recognitions", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  awardType: varchar("award_type").notNull(), // top_rated, patient_choice, excellence, safety
  awardName: varchar("award_name").notNull(),
  awardingOrganization: varchar("awarding_organization").notNull(),
  awardYear: integer("award_year").notNull(),
  description: text("description"),
  verificationStatus: varchar("verification_status").default("pending"), // verified, pending, disputed
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const providerAccessRelations = relations(providerAccess, ({ one }) => ({
  pet: one(pets, {
    fields: [providerAccess.petId],
    references: [pets.id],
  }),
  provider: one(users, {
    fields: [providerAccess.providerId],
    references: [users.id],
  }),
  owner: one(users, {
    fields: [providerAccess.ownerId],
    references: [users.id],
  }),
}));

export const providerSubscriptionRelations = relations(providerSubscriptions, ({ one }) => ({
  provider: one(users, {
    fields: [providerSubscriptions.providerId],
    references: [users.id],
  }),
}));

export const insurancePartnerRelations = relations(insurancePartners, ({ many }) => ({
  policies: many(petInsurancePolicies),
}));

export const petInsurancePolicyRelations = relations(petInsurancePolicies, ({ one, many }) => ({
  pet: one(pets, {
    fields: [petInsurancePolicies.petId],
    references: [pets.id],
  }),
  owner: one(users, {
    fields: [petInsurancePolicies.ownerId],
    references: [users.id],
  }),
  insurancePartner: one(insurancePartners, {
    fields: [petInsurancePolicies.insurancePartnerId],
    references: [insurancePartners.id],
  }),
  healthScores: many(healthScoreHistory),
  claims: many(insuranceClaims),
}));

export const healthScoreHistoryRelations = relations(healthScoreHistory, ({ one }) => ({
  pet: one(pets, {
    fields: [healthScoreHistory.petId],
    references: [pets.id],
  }),
  policy: one(petInsurancePolicies, {
    fields: [healthScoreHistory.policyId],
    references: [petInsurancePolicies.id],
  }),
}));

export const insuranceClaimRelations = relations(insuranceClaims, ({ one }) => ({
  policy: one(petInsurancePolicies, {
    fields: [insuranceClaims.policyId],
    references: [petInsurancePolicies.id],
  }),
  medicalRecord: one(medicalRecords, {
    fields: [insuranceClaims.medicalRecordId],
    references: [medicalRecords.id],
  }),
}));

export const providerQualityMetricsRelations = relations(providerQualityMetrics, ({ one, many }) => ({
  provider: one(serviceProviders, {
    fields: [providerQualityMetrics.providerId],
    references: [serviceProviders.id],
  }),
  performanceHistory: many(providerPerformanceHistory),
  recognitions: many(providerRecognitions),
}));

export const providerPerformanceHistoryRelations = relations(providerPerformanceHistory, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerPerformanceHistory.providerId],
    references: [serviceProviders.id],
  }),
  qualityMetrics: one(providerQualityMetrics, {
    fields: [providerPerformanceHistory.providerId],
    references: [providerQualityMetrics.providerId],
  }),
}));

export const providerRecognitionsRelations = relations(providerRecognitions, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerRecognitions.providerId],
    references: [serviceProviders.id],
  }),
  qualityMetrics: one(providerQualityMetrics, {
    fields: [providerRecognitions.providerId],
    references: [providerQualityMetrics.providerId],
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

export const insertProviderAccessSchema = createInsertSchema(providerAccess).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProviderSubscriptionSchema = createInsertSchema(providerSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInsurancePartnerSchema = createInsertSchema(insurancePartners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPetInsurancePolicySchema = createInsertSchema(petInsurancePolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthScoreHistorySchema = createInsertSchema(healthScoreHistory).omit({
  id: true,
  createdAt: true,
});

export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProviderQualityMetricsSchema = createInsertSchema(providerQualityMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastCalculated: true,
});

export const insertProviderPerformanceHistorySchema = createInsertSchema(providerPerformanceHistory).omit({
  id: true,
  createdAt: true,
  recordDate: true,
});

export const insertProviderRecognitionsSchema = createInsertSchema(providerRecognitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type InsertProviderAccess = z.infer<typeof insertProviderAccessSchema>;
export type ProviderAccess = typeof providerAccess.$inferSelect;

export type InsertProviderSubscription = z.infer<typeof insertProviderSubscriptionSchema>;
export type ProviderSubscription = typeof providerSubscriptions.$inferSelect;

export type InsertInsurancePartner = z.infer<typeof insertInsurancePartnerSchema>;
export type InsurancePartner = typeof insurancePartners.$inferSelect;

export type InsertPetInsurancePolicy = z.infer<typeof insertPetInsurancePolicySchema>;
export type PetInsurancePolicy = typeof petInsurancePolicies.$inferSelect;

export type InsertHealthScoreHistory = z.infer<typeof insertHealthScoreHistorySchema>;
export type HealthScoreHistory = typeof healthScoreHistory.$inferSelect;

export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;

export type InsertProviderQualityMetrics = z.infer<typeof insertProviderQualityMetricsSchema>;
export type ProviderQualityMetrics = typeof providerQualityMetrics.$inferSelect;

export type InsertProviderPerformanceHistory = z.infer<typeof insertProviderPerformanceHistorySchema>;
export type ProviderPerformanceHistory = typeof providerPerformanceHistory.$inferSelect;

export type InsertProviderRecognitions = z.infer<typeof insertProviderRecognitionsSchema>;
export type ProviderRecognitions = typeof providerRecognitions.$inferSelect;
