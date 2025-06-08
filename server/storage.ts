import {
  users,
  pets,
  medicalRecords,
  serviceProviders,
  reviews,
  appointments,
  sharedRecords,
  providerAccess,
  providerSubscriptions,
  insurancePartners,
  petInsurancePolicies,
  healthScoreHistory,
  insuranceClaims,
  providerQualityMetrics,
  providerPerformanceHistory,
  providerRecognitions,
  type User,
  type UpsertUser,
  type Pet,
  type InsertPet,
  type MedicalRecord,
  type InsertMedicalRecord,
  type ServiceProvider,
  type InsertServiceProvider,
  type Review,
  type InsertReview,
  type Appointment,
  type InsertAppointment,
  type SharedRecord,
  type InsertSharedRecord,
  type ProviderAccess,
  type InsertProviderAccess,
  type ProviderSubscription,
  type InsertProviderSubscription,
  type InsurancePartner,
  type InsertInsurancePartner,
  type PetInsurancePolicy,
  type InsertPetInsurancePolicy,
  type HealthScoreHistory,
  type InsertHealthScoreHistory,
  type InsuranceClaim,
  type InsertInsuranceClaim,
  type ProviderQualityMetrics,
  type InsertProviderQualityMetrics,
  type ProviderPerformanceHistory,
  type InsertProviderPerformanceHistory,
  type ProviderRecognitions,
  type InsertProviderRecognitions,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, gte, lte, or, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Pet operations
  getPetsByOwner(ownerId: string): Promise<Pet[]>;
  getPetById(id: number): Promise<Pet | undefined>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: number, pet: Partial<InsertPet>): Promise<Pet>;
  deletePet(id: number): Promise<void>;
  
  // Medical record operations
  getMedicalRecordsByPet(petId: number): Promise<MedicalRecord[]>;
  getMedicalRecordsByOwner(ownerId: string): Promise<(MedicalRecord & { pet: Pet })[]>;
  getMedicalRecordById(id: number): Promise<MedicalRecord | undefined>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  updateMedicalRecord(id: number, record: Partial<InsertMedicalRecord>): Promise<MedicalRecord>;
  deleteMedicalRecord(id: number): Promise<void>;
  
  // Service provider operations
  getServiceProviders(filters?: { city?: string; specialty?: string; userType?: string }): Promise<(ServiceProvider & { user: User })[]>;
  getServiceProviderById(id: number): Promise<(ServiceProvider & { user: User }) | undefined>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  updateServiceProvider(id: number, provider: Partial<InsertServiceProvider>): Promise<ServiceProvider>;
  
  // Review operations
  getReviewsByProvider(providerId: number): Promise<(Review & { reviewer: User; pet?: Pet })[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateProviderRating(providerId: number): Promise<void>;
  
  // Appointment operations
  getAppointmentsByPet(petId: number): Promise<(Appointment & { provider: ServiceProvider & { user: User } })[]>;
  getAppointmentsByOwner(ownerId: string): Promise<(Appointment & { pet: Pet; provider: ServiceProvider & { user: User } })[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  
  // Shared record operations
  shareRecord(sharedRecord: InsertSharedRecord): Promise<SharedRecord>;
  getSharedRecordsByUser(userId: string): Promise<(SharedRecord & { record: MedicalRecord & { pet: Pet } })[]>;
  
  // Provider access operations
  grantProviderAccess(access: InsertProviderAccess): Promise<ProviderAccess>;
  revokeProviderAccess(accessId: number): Promise<void>;
  getProviderAccessByProvider(providerId: string): Promise<(ProviderAccess & { pet: Pet & { owner: User } })[]>;
  getProviderAccessByPet(petId: number): Promise<(ProviderAccess & { provider: User })[]>;
  updateProviderAccessLastAccessed(accessId: number): Promise<void>;
  
  // Provider subscription operations
  createProviderSubscription(subscription: InsertProviderSubscription): Promise<ProviderSubscription>;
  getProviderSubscription(providerId: string): Promise<ProviderSubscription | undefined>;
  updateProviderSubscription(providerId: string, subscription: Partial<InsertProviderSubscription>): Promise<ProviderSubscription>;
  
  // Provider portal operations
  getAuthorizedPetsForProvider(providerId: string): Promise<(Pet & { owner: User; medicalRecords: MedicalRecord[] })[]>;
  checkProviderAccess(providerId: string, petId: number): Promise<boolean>;
  
  // Insurance partner operations
  getInsurancePartners(): Promise<InsurancePartner[]>;
  getInsurancePartnerById(id: number): Promise<InsurancePartner | undefined>;
  createInsurancePartner(partner: InsertInsurancePartner): Promise<InsurancePartner>;
  updateInsurancePartner(id: number, partner: Partial<InsertInsurancePartner>): Promise<InsurancePartner>;
  
  // Pet insurance policy operations
  getPetInsurancePolicies(ownerId: string): Promise<(PetInsurancePolicy & { pet: Pet; insurancePartner: InsurancePartner })[]>;
  getPetInsurancePolicyById(id: number): Promise<(PetInsurancePolicy & { pet: Pet; insurancePartner: InsurancePartner }) | undefined>;
  createPetInsurancePolicy(policy: InsertPetInsurancePolicy): Promise<PetInsurancePolicy>;
  updatePetInsurancePolicy(id: number, policy: Partial<InsertPetInsurancePolicy>): Promise<PetInsurancePolicy>;
  
  // Health score operations
  calculateHealthScore(petId: number): Promise<{ score: number; factors: any; discountEarned: number }>;
  createHealthScoreRecord(record: InsertHealthScoreHistory): Promise<HealthScoreHistory>;
  getHealthScoreHistory(petId: number): Promise<HealthScoreHistory[]>;
  updateInsuranceDiscounts(petId: number): Promise<void>;
  
  // Insurance claim operations
  getInsuranceClaimsByPolicy(policyId: number): Promise<(InsuranceClaim & { medicalRecord?: MedicalRecord })[]>;
  createInsuranceClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim>;
  updateInsuranceClaim(id: number, claim: Partial<InsertInsuranceClaim>): Promise<InsuranceClaim>;
  
  // Provider quality metrics operations
  getProviderQualityMetrics(providerId: number): Promise<ProviderQualityMetrics | undefined>;
  createProviderQualityMetrics(metrics: InsertProviderQualityMetrics): Promise<ProviderQualityMetrics>;
  updateProviderQualityMetrics(providerId: number, metrics: Partial<InsertProviderQualityMetrics>): Promise<ProviderQualityMetrics>;
  calculateProviderQualityMetrics(providerId: number): Promise<ProviderQualityMetrics>;
  
  // Provider performance history operations
  getProviderPerformanceHistory(providerId: number): Promise<ProviderPerformanceHistory[]>;
  createProviderPerformanceHistory(history: InsertProviderPerformanceHistory): Promise<ProviderPerformanceHistory>;
  
  // Provider recognitions operations
  getProviderRecognitions(providerId: number): Promise<ProviderRecognitions[]>;
  createProviderRecognition(recognition: InsertProviderRecognitions): Promise<ProviderRecognitions>;
  updateProviderRecognition(id: number, recognition: Partial<InsertProviderRecognitions>): Promise<ProviderRecognitions>;
  
  // Provider grading operations (similar to Healthgrades)
  getTopRatedProviders(limit?: number): Promise<(ServiceProvider & { user: User; qualityMetrics: ProviderQualityMetrics })[]>;
  getProvidersBySpecialty(specialty: string, limit?: number): Promise<(ServiceProvider & { user: User; qualityMetrics: ProviderQualityMetrics })[]>;
  searchProvidersByQuality(filters: { city?: string; minRating?: number; specialty?: string }): Promise<(ServiceProvider & { user: User; qualityMetrics: ProviderQualityMetrics })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  // Pet operations
  async getPetsByOwner(ownerId: string): Promise<Pet[]> {
    return await db
      .select()
      .from(pets)
      .where(and(eq(pets.ownerId, ownerId), eq(pets.isActive, true)))
      .orderBy(desc(pets.createdAt));
  }

  async getPetById(id: number): Promise<Pet | undefined> {
    const [pet] = await db
      .select()
      .from(pets)
      .where(and(eq(pets.id, id), eq(pets.isActive, true)));
    return pet;
  }

  async createPet(pet: InsertPet): Promise<Pet> {
    const [newPet] = await db.insert(pets).values(pet).returning();
    return newPet;
  }

  async updatePet(id: number, pet: Partial<InsertPet>): Promise<Pet> {
    const [updatedPet] = await db
      .update(pets)
      .set({ ...pet, updatedAt: new Date() })
      .where(eq(pets.id, id))
      .returning();
    return updatedPet;
  }

  async deletePet(id: number): Promise<void> {
    await db
      .update(pets)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(pets.id, id));
  }

  // Medical record operations
  async getMedicalRecordsByPet(petId: number): Promise<MedicalRecord[]> {
    return await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.petId, petId))
      .orderBy(desc(medicalRecords.visitDate));
  }

  async getMedicalRecordsByOwner(ownerId: string): Promise<(MedicalRecord & { pet: Pet })[]> {
    return await db
      .select()
      .from(medicalRecords)
      .innerJoin(pets, eq(medicalRecords.petId, pets.id))
      .where(and(eq(pets.ownerId, ownerId), eq(pets.isActive, true)))
      .orderBy(desc(medicalRecords.visitDate));
  }

  async getMedicalRecordById(id: number): Promise<MedicalRecord | undefined> {
    const [record] = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, id));
    return record;
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const [newRecord] = await db.insert(medicalRecords).values(record).returning();
    return newRecord;
  }

  async updateMedicalRecord(id: number, record: Partial<InsertMedicalRecord>): Promise<MedicalRecord> {
    const [updatedRecord] = await db
      .update(medicalRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(medicalRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteMedicalRecord(id: number): Promise<void> {
    await db.delete(medicalRecords).where(eq(medicalRecords.id, id));
  }

  // Service provider operations
  async getServiceProviders(filters?: { city?: string; specialty?: string; userType?: string }): Promise<(ServiceProvider & { user: User })[]> {
    let query = db
      .select()
      .from(serviceProviders)
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .where(eq(serviceProviders.isVerified, true));

    if (filters?.city) {
      query = query.where(ilike(serviceProviders.city, `%${filters.city}%`));
    }

    if (filters?.userType) {
      query = query.where(eq(users.userType, filters.userType));
    }

    return await query.orderBy(desc(serviceProviders.rating));
  }

  async getServiceProviderById(id: number): Promise<(ServiceProvider & { user: User }) | undefined> {
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .where(eq(serviceProviders.id, id));
    return provider;
  }

  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [newProvider] = await db.insert(serviceProviders).values(provider).returning();
    return newProvider;
  }

  async updateServiceProvider(id: number, provider: Partial<InsertServiceProvider>): Promise<ServiceProvider> {
    const [updatedProvider] = await db
      .update(serviceProviders)
      .set({ ...provider, updatedAt: new Date() })
      .where(eq(serviceProviders.id, id))
      .returning();
    return updatedProvider;
  }

  // Review operations
  async getReviewsByProvider(providerId: number): Promise<(Review & { reviewer: User; pet?: Pet })[]> {
    return await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .leftJoin(pets, eq(reviews.petId, pets.id))
      .where(eq(reviews.providerId, providerId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    await this.updateProviderRating(review.providerId);
    return newReview;
  }

  async updateProviderRating(providerId: number): Promise<void> {
    const [stats] = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.providerId, providerId));

    await db
      .update(serviceProviders)
      .set({
        rating: stats.avgRating.toString(),
        reviewCount: stats.count,
        updatedAt: new Date(),
      })
      .where(eq(serviceProviders.id, providerId));
  }

  // Appointment operations
  async getAppointmentsByPet(petId: number): Promise<(Appointment & { provider: ServiceProvider & { user: User } })[]> {
    return await db
      .select()
      .from(appointments)
      .innerJoin(serviceProviders, eq(appointments.providerId, serviceProviders.id))
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .where(eq(appointments.petId, petId))
      .orderBy(desc(appointments.scheduledDate));
  }

  async getAppointmentsByOwner(ownerId: string): Promise<(Appointment & { pet: Pet; provider: ServiceProvider & { user: User } })[]> {
    return await db
      .select()
      .from(appointments)
      .innerJoin(pets, eq(appointments.petId, pets.id))
      .innerJoin(serviceProviders, eq(appointments.providerId, serviceProviders.id))
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .where(and(eq(pets.ownerId, ownerId), eq(pets.isActive, true)))
      .orderBy(desc(appointments.scheduledDate));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  // Shared record operations
  async shareRecord(sharedRecord: InsertSharedRecord): Promise<SharedRecord> {
    const [newSharedRecord] = await db.insert(sharedRecords).values(sharedRecord).returning();
    return newSharedRecord;
  }

  async getSharedRecordsByUser(userId: string): Promise<(SharedRecord & { record: MedicalRecord & { pet: Pet } })[]> {
    return await db
      .select()
      .from(sharedRecords)
      .innerJoin(medicalRecords, eq(sharedRecords.recordId, medicalRecords.id))
      .innerJoin(pets, eq(medicalRecords.petId, pets.id))
      .where(and(eq(sharedRecords.sharedWithId, userId), eq(sharedRecords.isRevoked, false)))
      .orderBy(desc(sharedRecords.createdAt));
  }

  // Provider access operations
  async grantProviderAccess(access: InsertProviderAccess): Promise<ProviderAccess> {
    const [newAccess] = await db
      .insert(providerAccess)
      .values(access)
      .returning();
    return newAccess;
  }

  async revokeProviderAccess(accessId: number): Promise<void> {
    await db
      .update(providerAccess)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(providerAccess.id, accessId));
  }

  async getProviderAccessByProvider(providerId: string): Promise<(ProviderAccess & { pet: Pet & { owner: User } })[]> {
    const accessList = await db
      .select()
      .from(providerAccess)
      .leftJoin(pets, eq(providerAccess.petId, pets.id))
      .leftJoin(users, eq(pets.ownerId, users.id))
      .where(and(
        eq(providerAccess.providerId, providerId),
        eq(providerAccess.isActive, true)
      ));

    return accessList.map(access => ({
      ...access.provider_access,
      pet: {
        ...access.pets,
        owner: access.users,
      },
    })) as any;
  }

  async getProviderAccessByPet(petId: number): Promise<(ProviderAccess & { provider: User })[]> {
    const accessList = await db
      .select()
      .from(providerAccess)
      .leftJoin(users, eq(providerAccess.providerId, users.id))
      .where(and(
        eq(providerAccess.petId, petId),
        eq(providerAccess.isActive, true)
      ));

    return accessList.map(access => ({
      ...access.provider_access,
      provider: access.users,
    })) as any;
  }

  async updateProviderAccessLastAccessed(accessId: number): Promise<void> {
    await db
      .update(providerAccess)
      .set({ lastAccessedAt: new Date(), updatedAt: new Date() })
      .where(eq(providerAccess.id, accessId));
  }

  // Provider subscription operations
  async createProviderSubscription(subscription: InsertProviderSubscription): Promise<ProviderSubscription> {
    const [newSubscription] = await db
      .insert(providerSubscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  async getProviderSubscription(providerId: string): Promise<ProviderSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(providerSubscriptions)
      .where(eq(providerSubscriptions.providerId, providerId));
    return subscription;
  }

  async updateProviderSubscription(providerId: string, subscription: Partial<InsertProviderSubscription>): Promise<ProviderSubscription> {
    const [updated] = await db
      .update(providerSubscriptions)
      .set({ ...subscription, updatedAt: new Date() })
      .where(eq(providerSubscriptions.providerId, providerId))
      .returning();
    return updated;
  }

  // Provider portal operations
  async getAuthorizedPetsForProvider(providerId: string): Promise<(Pet & { owner: User; medicalRecords: MedicalRecord[] })[]> {
    const accessList = await db
      .select()
      .from(providerAccess)
      .leftJoin(pets, eq(providerAccess.petId, pets.id))
      .leftJoin(users, eq(pets.ownerId, users.id))
      .where(and(
        eq(providerAccess.providerId, providerId),
        eq(providerAccess.isActive, true)
      ));

    const petsWithRecords = await Promise.all(
      accessList.map(async (access) => {
        const records = await this.getMedicalRecordsByPet(access.pets!.id);
        return {
          ...access.pets!,
          owner: access.users!,
          medicalRecords: records,
        };
      })
    );

    return petsWithRecords;
  }

  async checkProviderAccess(providerId: string, petId: number): Promise<boolean> {
    const [access] = await db
      .select()
      .from(providerAccess)
      .where(and(
        eq(providerAccess.providerId, providerId),
        eq(providerAccess.petId, petId),
        eq(providerAccess.isActive, true)
      ));
    return !!access;
  }

  // Insurance partner operations
  async getInsurancePartners(): Promise<InsurancePartner[]> {
    return await db.select().from(insurancePartners);
  }

  async getInsurancePartnerById(id: number): Promise<InsurancePartner | undefined> {
    const [partner] = await db.select().from(insurancePartners).where(eq(insurancePartners.id, id));
    return partner;
  }

  async createInsurancePartner(partner: InsertInsurancePartner): Promise<InsurancePartner> {
    const [newPartner] = await db.insert(insurancePartners).values(partner).returning();
    return newPartner;
  }

  async updateInsurancePartner(id: number, partner: Partial<InsertInsurancePartner>): Promise<InsurancePartner> {
    const [updatedPartner] = await db
      .update(insurancePartners)
      .set({ ...partner, updatedAt: new Date() })
      .where(eq(insurancePartners.id, id))
      .returning();
    return updatedPartner;
  }

  // Pet insurance policy operations
  async getPetInsurancePolicies(ownerId: string): Promise<(PetInsurancePolicy & { pet: Pet; insurancePartner: InsurancePartner })[]> {
    const policies = await db
      .select()
      .from(petInsurancePolicies)
      .leftJoin(pets, eq(petInsurancePolicies.petId, pets.id))
      .leftJoin(insurancePartners, eq(petInsurancePolicies.insurancePartnerId, insurancePartners.id))
      .where(eq(pets.ownerId, ownerId));

    return policies.map(policy => ({
      ...policy.pet_insurance_policies,
      pet: policy.pets,
      insurancePartner: policy.insurance_partners,
    })) as any;
  }

  async getPetInsurancePolicyById(id: number): Promise<(PetInsurancePolicy & { pet: Pet; insurancePartner: InsurancePartner }) | undefined> {
    const [policy] = await db
      .select()
      .from(petInsurancePolicies)
      .leftJoin(pets, eq(petInsurancePolicies.petId, pets.id))
      .leftJoin(insurancePartners, eq(petInsurancePolicies.insurancePartnerId, insurancePartners.id))
      .where(eq(petInsurancePolicies.id, id));

    if (!policy) return undefined;

    return {
      ...policy.pet_insurance_policies,
      pet: policy.pets,
      insurancePartner: policy.insurance_partners,
    } as any;
  }

  async createPetInsurancePolicy(policy: InsertPetInsurancePolicy): Promise<PetInsurancePolicy> {
    const [newPolicy] = await db.insert(petInsurancePolicies).values(policy).returning();
    return newPolicy;
  }

  async updatePetInsurancePolicy(id: number, policy: Partial<InsertPetInsurancePolicy>): Promise<PetInsurancePolicy> {
    const [updatedPolicy] = await db
      .update(petInsurancePolicies)
      .set({ ...policy, updatedAt: new Date() })
      .where(eq(petInsurancePolicies.id, id))
      .returning();
    return updatedPolicy;
  }

  // Health score operations
  async calculateHealthScore(petId: number): Promise<{ score: number; factors: any; discountEarned: number }> {
    const records = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.petId, petId))
      .orderBy(desc(medicalRecords.visitDate));

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentRecords = records.filter(record => 
      record.visitDate && new Date(record.visitDate) >= oneYearAgo
    );

    let score = 0;
    const factors = {
      recentCheckups: 0,
      vaccinations: 0,
      preventiveCare: 0,
      consistency: 0
    };

    // Recent checkups (30 points max)
    const checkups = recentRecords.filter(r => r.recordType === 'checkup');
    factors.recentCheckups = Math.min(checkups.length * 10, 30);

    // Vaccinations (25 points max)
    const vaccinations = recentRecords.filter(r => r.recordType === 'vaccination');
    factors.vaccinations = Math.min(vaccinations.length * 8, 25);

    // Preventive care (25 points max)
    const preventive = recentRecords.filter(r => r.recordType === 'preventive');
    factors.preventiveCare = Math.min(preventive.length * 5, 25);

    // Visit consistency (20 points max)
    if (recentRecords.length >= 4) {
      factors.consistency = 20;
    } else if (recentRecords.length >= 2) {
      factors.consistency = 10;
    }

    score = factors.recentCheckups + factors.vaccinations + factors.preventiveCare + factors.consistency;

    // Calculate discount based on score
    let discountEarned = 0;
    if (score >= 80) discountEarned = 25;
    else if (score >= 60) discountEarned = 15;
    else if (score >= 40) discountEarned = 10;
    else if (score >= 20) discountEarned = 5;

    return { score, factors, discountEarned };
  }

  async createHealthScoreRecord(record: InsertHealthScoreHistory): Promise<HealthScoreHistory> {
    const [newRecord] = await db.insert(healthScoreHistory).values(record).returning();
    return newRecord;
  }

  async getHealthScoreHistory(petId: number): Promise<HealthScoreHistory[]> {
    return await db
      .select()
      .from(healthScoreHistory)
      .where(eq(healthScoreHistory.petId, petId))
      .orderBy(desc(healthScoreHistory.calculatedAt));
  }

  async updateInsuranceDiscounts(petId: number): Promise<void> {
    const { score, discountEarned } = await this.calculateHealthScore(petId);
    
    await db
      .update(petInsurancePolicies)
      .set({
        currentDiscount: discountEarned.toString(),
        lastHealthScore: score,
        updatedAt: new Date()
      })
      .where(eq(petInsurancePolicies.petId, petId));
  }

  // Insurance claim operations
  async getInsuranceClaimsByPolicy(policyId: number): Promise<(InsuranceClaim & { medicalRecord?: MedicalRecord })[]> {
    const claims = await db
      .select()
      .from(insuranceClaims)
      .leftJoin(medicalRecords, eq(insuranceClaims.medicalRecordId, medicalRecords.id))
      .where(eq(insuranceClaims.policyId, policyId));

    return claims.map(claim => ({
      ...claim.insurance_claims,
      medicalRecord: claim.medical_records || undefined,
    })) as any;
  }

  async createInsuranceClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim> {
    const [newClaim] = await db.insert(insuranceClaims).values(claim).returning();
    return newClaim;
  }

  async updateInsuranceClaim(id: number, claim: Partial<InsertInsuranceClaim>): Promise<InsuranceClaim> {
    const [updatedClaim] = await db
      .update(insuranceClaims)
      .set({ ...claim, updatedAt: new Date() })
      .where(eq(insuranceClaims.id, id))
      .returning();
    return updatedClaim;
  }

  // Provider quality metrics operations (Healthgrades-style grading)
  async getProviderQualityMetrics(providerId: number): Promise<ProviderQualityMetrics | undefined> {
    const [metrics] = await db
      .select()
      .from(providerQualityMetrics)
      .where(eq(providerQualityMetrics.providerId, providerId));
    return metrics;
  }

  async createProviderQualityMetrics(metrics: InsertProviderQualityMetrics): Promise<ProviderQualityMetrics> {
    const [newMetrics] = await db.insert(providerQualityMetrics).values(metrics).returning();
    return newMetrics;
  }

  async updateProviderQualityMetrics(providerId: number, metrics: Partial<InsertProviderQualityMetrics>): Promise<ProviderQualityMetrics> {
    const [updatedMetrics] = await db
      .update(providerQualityMetrics)
      .set({ ...metrics, updatedAt: new Date(), lastCalculated: new Date() })
      .where(eq(providerQualityMetrics.providerId, providerId))
      .returning();
    return updatedMetrics;
  }

  async calculateProviderQualityMetrics(providerId: number): Promise<ProviderQualityMetrics> {
    // Get all reviews for this provider
    const providerReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.providerId, providerId));

    // Get all medical records for this provider
    const providerRecords = await db
      .select()
      .from(medicalRecords)
      .leftJoin(serviceProviders, eq(medicalRecords.providerId, serviceProviders.userId))
      .where(eq(serviceProviders.id, providerId));

    // Calculate metrics
    const totalReviews = providerReviews.length;
    const averageRating = totalReviews > 0 
      ? providerReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const recommendationRate = totalReviews > 0
      ? (providerReviews.filter(r => r.isRecommended).length / totalReviews) * 100
      : 0;

    const totalPatients = new Set(providerRecords.map(r => r.medical_records?.petId)).size;
    const totalProcedures = providerRecords.length;

    // Calculate clinical quality score based on patient outcomes
    const emergencyRate = totalProcedures > 0 
      ? (providerRecords.filter(r => r.medical_records?.isEmergency).length / totalProcedures) * 100
      : 0;

    const clinicalQualityScore = Math.max(0, 100 - emergencyRate * 2); // Lower emergency rate = higher quality

    // Calculate patient experience score from reviews
    const communicationRating = totalReviews > 0
      ? providerReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    const patientExperienceScore = (communicationRating / 5) * 100;

    const metricsData: InsertProviderQualityMetrics = {
      providerId,
      overallRating: averageRating.toString(),
      totalPatients,
      totalProcedures,
      clinicalQualityScore: Math.round(clinicalQualityScore),
      patientExperienceScore: Math.round(patientExperienceScore),
      patientSafetyScore: Math.round(100 - emergencyRate), // Higher safety = fewer emergencies
      timeliness: 85, // Default score, would be calculated from appointment data
      effectiveness: Math.round(clinicalQualityScore),
      successRate: Math.max(0, 100 - emergencyRate).toString(),
      complicationRate: emergencyRate.toString(),
      communicationRating: communicationRating.toString(),
      compassionRating: communicationRating.toString(),
      professionalismRating: communicationRating.toString(),
      recommendationRate: recommendationRate.toString(),
      dataPoints: totalReviews + totalProcedures,
    };

    // Check if metrics already exist
    const existing = await this.getProviderQualityMetrics(providerId);
    
    if (existing) {
      return await this.updateProviderQualityMetrics(providerId, metricsData);
    } else {
      return await this.createProviderQualityMetrics(metricsData);
    }
  }

  // Provider performance history operations
  async getProviderPerformanceHistory(providerId: number): Promise<ProviderPerformanceHistory[]> {
    return await db
      .select()
      .from(providerPerformanceHistory)
      .where(eq(providerPerformanceHistory.providerId, providerId))
      .orderBy(desc(providerPerformanceHistory.recordDate));
  }

  async createProviderPerformanceHistory(history: InsertProviderPerformanceHistory): Promise<ProviderPerformanceHistory> {
    const [newHistory] = await db.insert(providerPerformanceHistory).values(history).returning();
    return newHistory;
  }

  // Provider recognitions operations
  async getProviderRecognitions(providerId: number): Promise<ProviderRecognitions[]> {
    return await db
      .select()
      .from(providerRecognitions)
      .where(and(
        eq(providerRecognitions.providerId, providerId),
        eq(providerRecognitions.isActive, true)
      ))
      .orderBy(desc(providerRecognitions.awardYear));
  }

  async createProviderRecognition(recognition: InsertProviderRecognitions): Promise<ProviderRecognitions> {
    const [newRecognition] = await db.insert(providerRecognitions).values(recognition).returning();
    return newRecognition;
  }

  async updateProviderRecognition(id: number, recognition: Partial<InsertProviderRecognitions>): Promise<ProviderRecognitions> {
    const [updatedRecognition] = await db
      .update(providerRecognitions)
      .set({ ...recognition, updatedAt: new Date() })
      .where(eq(providerRecognitions.id, id))
      .returning();
    return updatedRecognition;
  }

  // Provider grading operations (Healthgrades-style search and ranking)
  async getTopRatedProviders(limit = 10): Promise<(ServiceProvider & { user: User; qualityMetrics: ProviderQualityMetrics })[]> {
    const providers = await db
      .select()
      .from(serviceProviders)
      .leftJoin(users, eq(serviceProviders.userId, users.id))
      .leftJoin(providerQualityMetrics, eq(serviceProviders.id, providerQualityMetrics.providerId))
      .where(
        gte(providerQualityMetrics.overallRating, "4.2")
      )
      .orderBy(desc(providerQualityMetrics.overallRating))
      .limit(limit);

    return providers.map(provider => ({
      ...provider.service_providers,
      user: provider.users,
      qualityMetrics: provider.provider_quality_metrics,
    })) as any;
  }

  async getProvidersBySpecialty(specialty: string, limit = 10): Promise<(ServiceProvider & { user: User; qualityMetrics: ProviderQualityMetrics })[]> {
    const providers = await db
      .select()
      .from(serviceProviders)
      .leftJoin(users, eq(serviceProviders.userId, users.id))
      .leftJoin(providerQualityMetrics, eq(serviceProviders.id, providerQualityMetrics.providerId))
      .where(sql`${serviceProviders.specialties} @> ARRAY[${specialty}]::text[]`)
      .orderBy(desc(providerQualityMetrics.overallRating))
      .limit(limit);

    return providers.map(provider => ({
      ...provider.service_providers,
      user: provider.users,
      qualityMetrics: provider.provider_quality_metrics,
    })) as any;
  }

  async searchProvidersByQuality(filters: { city?: string; minRating?: number; specialty?: string }): Promise<(ServiceProvider & { user: User; qualityMetrics: ProviderQualityMetrics })[]> {
    let query = db
      .select()
      .from(serviceProviders)
      .leftJoin(users, eq(serviceProviders.userId, users.id))
      .leftJoin(providerQualityMetrics, eq(serviceProviders.id, providerQualityMetrics.providerId));

    const conditions = [];

    if (filters.city) {
      conditions.push(ilike(serviceProviders.city, `%${filters.city}%`));
    }

    if (filters.minRating) {
      conditions.push(gte(providerQualityMetrics.overallRating, filters.minRating.toString()));
    }

    if (filters.specialty) {
      conditions.push(sql`${serviceProviders.specialties} @> ARRAY[${filters.specialty}]::text[]`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const providers = await query.orderBy(desc(providerQualityMetrics.overallRating));

    return providers.map(provider => ({
      ...provider.service_providers,
      user: provider.users,
      qualityMetrics: provider.provider_quality_metrics,
    })) as any;
  }
}

export const storage = new DatabaseStorage();
