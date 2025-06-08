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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, gte, lte } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
