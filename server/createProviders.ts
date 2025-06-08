import { db } from './db';
import { serviceProviders, users, providerQualityMetrics, reviews } from '@shared/schema';

export async function createSampleProviders() {
  try {
    // Create provider users
    const providerUsers = [
      {
        id: `provider_${Date.now()}_1`,
        email: "sarah.thompson@thompsonvet.com",
        firstName: "Sarah",
        lastName: "Thompson",
        userType: "provider"
      },
      {
        id: `provider_${Date.now()}_2`,
        email: "michael.chen@chenmedical.com",
        firstName: "Michael", 
        lastName: "Chen",
        userType: "provider"
      },
      {
        id: `provider_${Date.now()}_3`,
        email: "emily.rodriguez@emergencyvet.com",
        firstName: "Emily",
        lastName: "Rodriguez", 
        userType: "provider"
      },
      {
        id: `provider_${Date.now()}_4`,
        email: "david.johnson@familypet.com",
        firstName: "David",
        lastName: "Johnson",
        userType: "provider"
      }
    ];

    const insertedUsers = await db.insert(users).values(providerUsers).returning();

    // Create service providers
    const providers = [
      {
        userId: insertedUsers[0].id,
        businessName: "Thompson Veterinary Excellence",
        licenseNumber: "VET-2024-001",
        specialties: ["Cardiology"],
        address: "123 Heart Ave, Springfield, IL 62701",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        phone: "(555) 123-4567",
        website: "https://thompsonvet.com",
        description: "Board-certified veterinary cardiologist specializing in heart conditions, diagnostic cardiology, and cardiac surgery. Exceptional quality metrics with outstanding patient outcomes.",
        isVerified: true,
        rating: "4.9",
        reviewCount: 312
      },
      {
        userId: insertedUsers[1].id,
        businessName: "Chen Animal Medical Center", 
        licenseNumber: "VET-2024-002",
        specialties: ["Surgery"],
        address: "456 Surgery Blvd, Springfield, IL 62702", 
        city: "Springfield",
        state: "IL",
        zipCode: "62702",
        phone: "(555) 234-5678",
        website: "https://chenmedical.com",
        description: "Experienced veterinary surgeon with expertise in soft tissue and orthopedic procedures. Superior care standards with excellent clinical results.",
        isVerified: true,
        rating: "4.8",
        reviewCount: 287
      },
      {
        userId: insertedUsers[2].id,
        businessName: "Rodriguez Emergency Veterinary",
        licenseNumber: "VET-2024-003", 
        specialties: ["Emergency"],
        address: "789 Emergency Dr, Springfield, IL 62703",
        city: "Springfield",
        state: "IL", 
        zipCode: "62703",
        phone: "(555) 345-6789",
        website: "https://emergencyvet.com",
        description: "24/7 emergency veterinary services with state-of-the-art facilities. Superior care standards with excellent clinical results and high patient satisfaction.",
        isVerified: true,
        rating: "4.7", 
        reviewCount: 456
      },
      {
        userId: insertedUsers[3].id,
        businessName: "Johnson Family Pet Care",
        licenseNumber: "VET-2024-004",
        specialties: ["General Practice"], 
        address: "321 Family Way, Springfield, IL 62704",
        city: "Springfield",
        state: "IL",
        zipCode: "62704", 
        phone: "(555) 456-7890",
        website: "https://familypet.com",
        description: "Full-service veterinary clinic providing comprehensive care. High-quality veterinary services with very good patient outcomes and care standards.",
        isVerified: true,
        rating: "4.6",
        reviewCount: 198
      }
    ];

    const insertedProviders = await db.insert(serviceProviders).values(providers).returning();

    // Create quality metrics
    const qualityMetrics = [
      {
        providerId: insertedProviders[0].id,
        overallRating: "4.9",
        totalPatients: 650,
        totalProcedures: 890,
        yearsOfExperience: 15,
        clinicalQualityScore: 95,
        patientSafetyScore: 98,
        patientExperienceScore: 92,
        timeliness: 90,
        effectiveness: 94,
        successRate: "98.00",
        complicationRate: "0.20",
        readmissionRate: "0.15",
        emergencyResponseTime: 8,
        averageAppointmentWaitTime: 12,
        communicationRating: "4.9",
        compassionRating: "4.8",
        professionalismRating: "4.9",
        recommendationRate: "98.20",
        boardCertifications: ["Board Certified Veterinary Cardiologist", "Advanced Echocardiography"],
        specialtyCertifications: ["Advanced Cardiology", "Cardiology Board Certification"],
        continuingEducationHours: 85,
        averageCostRating: "4.2",
        insuranceAcceptanceRate: "95.00",
        wheelchairAccessible: true,
        emergencyServices: false,
        telemedicineAvailable: true,
        calculationPeriod: "12_months",
        dataPoints: 312
      },
      {
        providerId: insertedProviders[1].id,
        overallRating: "4.8",
        totalPatients: 580,
        totalProcedures: 1200,
        yearsOfExperience: 12,
        clinicalQualityScore: 88,
        patientSafetyScore: 91,
        patientExperienceScore: 87,
        timeliness: 85,
        effectiveness: 89,
        successRate: "96.00",
        complicationRate: "0.40",
        readmissionRate: "0.30",
        emergencyResponseTime: 10,
        averageAppointmentWaitTime: 15,
        communicationRating: "4.8",
        compassionRating: "4.7",
        professionalismRating: "4.8",
        recommendationRate: "96.40",
        boardCertifications: ["Board Certified Veterinary Surgeon", "Advanced Surgical Techniques"],
        specialtyCertifications: ["Advanced Surgery", "Surgery Board Certification"],
        continuingEducationHours: 78,
        averageCostRating: "4.0",
        insuranceAcceptanceRate: "92.00",
        wheelchairAccessible: true,
        emergencyServices: true,
        telemedicineAvailable: true,
        calculationPeriod: "12_months",
        dataPoints: 287
      },
      {
        providerId: insertedProviders[2].id,
        overallRating: "4.7",
        totalPatients: 890,
        totalProcedures: 1500,
        yearsOfExperience: 10,
        clinicalQualityScore: 88,
        patientSafetyScore: 91,
        patientExperienceScore: 87,
        timeliness: 85,
        effectiveness: 89,
        successRate: "94.00",
        complicationRate: "0.60",
        readmissionRate: "0.45",
        emergencyResponseTime: 5,
        averageAppointmentWaitTime: 8,
        communicationRating: "4.7",
        compassionRating: "4.6",
        professionalismRating: "4.7",
        recommendationRate: "94.60",
        boardCertifications: ["Emergency and Critical Care Certification", "Advanced Life Support"],
        specialtyCertifications: ["Advanced Emergency", "Emergency Board Certification"],
        continuingEducationHours: 92,
        averageCostRating: "3.8",
        insuranceAcceptanceRate: "88.00",
        wheelchairAccessible: true,
        emergencyServices: true,
        telemedicineAvailable: false,
        calculationPeriod: "12_months",
        dataPoints: 456
      },
      {
        providerId: insertedProviders[3].id,
        overallRating: "4.6",
        totalPatients: 420,
        totalProcedures: 650,
        yearsOfExperience: 8,
        clinicalQualityScore: 82,
        patientSafetyScore: 85,
        patientExperienceScore: 80,
        timeliness: 78,
        effectiveness: 83,
        successRate: "92.00",
        complicationRate: "0.80",
        readmissionRate: "0.60",
        emergencyResponseTime: 15,
        averageAppointmentWaitTime: 20,
        communicationRating: "4.6",
        compassionRating: "4.5",
        professionalismRating: "4.6",
        recommendationRate: "92.80",
        boardCertifications: ["Doctor of Veterinary Medicine", "Fear Free Certification"],
        specialtyCertifications: ["Advanced General Practice", "General Practice Board Certification"],
        continuingEducationHours: 65,
        averageCostRating: "4.3",
        insuranceAcceptanceRate: "96.00",
        wheelchairAccessible: true,
        emergencyServices: false,
        telemedicineAvailable: true,
        calculationPeriod: "12_months",
        dataPoints: 198
      }
    ];

    await db.insert(providerQualityMetrics).values(qualityMetrics);

    console.log('Sample providers created successfully!');
    return {
      providers: insertedProviders.length,
      users: insertedUsers.length,
      qualityMetrics: qualityMetrics.length
    };
  } catch (error) {
    console.error('Error creating sample providers:', error);
    throw error;
  }
}