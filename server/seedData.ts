import { db } from './db';
import { pets, medicalRecords, serviceProviders, users, providerQualityMetrics, reviews } from '@shared/schema';

// Helper functions
function getProviderDescription(specialty: string, grade: string): string {
  const descriptions = {
    'Cardiology': 'Board-certified veterinary cardiologist specializing in heart conditions, diagnostic cardiology, and cardiac surgery. Advanced training in echocardiography and cardiac interventions.',
    'Surgery': 'Experienced veterinary surgeon with expertise in soft tissue and orthopedic procedures. Specializes in minimally invasive techniques and post-operative care.',
    'Emergency': '24/7 emergency veterinary services with state-of-the-art facilities. Experienced in critical care, trauma surgery, and emergency medicine.',
    'General Practice': 'Full-service veterinary clinic providing comprehensive care including wellness exams, vaccinations, dental care, and preventive medicine.',
    'Exotic Animals': 'Specialized care for exotic pets including birds, reptiles, small mammals, and pocket pets. Advanced training in exotic animal medicine.',
    'Dentistry': 'Veterinary dental specialist offering advanced dental procedures, oral surgery, and preventive dental care for pets.',
    'Dermatology': 'Board-certified veterinary dermatologist treating skin conditions, allergies, and dermatological disorders in companion animals.',
    'Oncology': 'Veterinary oncologist specializing in cancer diagnosis and treatment including chemotherapy, radiation therapy, and surgical oncology.'
  };
  
  const gradeDescriptions = {
    'A+': 'Exceptional quality metrics with outstanding patient outcomes and satisfaction scores.',
    'A': 'Superior care standards with excellent clinical results and high patient satisfaction.',
    'A-': 'High-quality veterinary services with very good patient outcomes and care standards.'
  };
  
  return `${descriptions[specialty as keyof typeof descriptions]} ${gradeDescriptions[grade as keyof typeof gradeDescriptions]}`;
}

function getCertifications(specialty: string): string[] {
  const certificationMap = {
    'Cardiology': ['Board Certified Veterinary Cardiologist', 'Advanced Echocardiography', 'Cardiac Surgery Certification'],
    'Surgery': ['Board Certified Veterinary Surgeon', 'Advanced Surgical Techniques', 'Minimally Invasive Surgery'],
    'Emergency': ['Emergency and Critical Care Certification', 'Advanced Life Support', 'Trauma Surgery'],
    'General Practice': ['Doctor of Veterinary Medicine', 'Fear Free Certification', 'Wellness Care Specialist'],
    'Exotic Animals': ['Exotic Animal Medicine Certification', 'Avian Medicine Specialist', 'Small Mammal Care'],
    'Dentistry': ['Veterinary Dental Certification', 'Oral Surgery Specialist', 'Advanced Periodontics'],
    'Dermatology': ['Board Certified Veterinary Dermatologist', 'Allergy Testing Certification', 'Dermatopathology'],
    'Oncology': ['Veterinary Oncology Certification', 'Chemotherapy Administration', 'Radiation Therapy']
  };
  
  return certificationMap[specialty as keyof typeof certificationMap] || ['Doctor of Veterinary Medicine'];
}

// Generate realistic provider names
const providerProfiles = [
  { 
    firstName: "Sarah", 
    lastName: "Thompson", 
    businessName: "Thompson Veterinary Excellence", 
    specialty: "Cardiology",
    grade: "A+",
    rating: 4.9,
    reviewCount: 312
  },
  { 
    firstName: "Michael", 
    lastName: "Chen", 
    businessName: "Chen Animal Medical Center", 
    specialty: "Surgery",
    grade: "A",
    rating: 4.8,
    reviewCount: 287
  },
  { 
    firstName: "Emily", 
    lastName: "Rodriguez", 
    businessName: "Rodriguez Emergency Veterinary", 
    specialty: "Emergency",
    grade: "A",
    rating: 4.7,
    reviewCount: 456
  },
  { 
    firstName: "David", 
    lastName: "Johnson", 
    businessName: "Johnson Family Pet Care", 
    specialty: "General Practice",
    grade: "A-",
    rating: 4.6,
    reviewCount: 198
  },
  { 
    firstName: "Lisa", 
    lastName: "Williams", 
    businessName: "Williams Exotic Animal Clinic", 
    specialty: "Exotic Animals",
    grade: "A+",
    rating: 4.9,
    reviewCount: 156
  },
  { 
    firstName: "Robert", 
    lastName: "Davis", 
    businessName: "Davis Dental Veterinary", 
    specialty: "Dentistry",
    grade: "A",
    rating: 4.8,
    reviewCount: 234
  },
  { 
    firstName: "Jennifer", 
    lastName: "Miller", 
    businessName: "Miller Dermatology for Pets", 
    specialty: "Dermatology",
    grade: "A-",
    rating: 4.5,
    reviewCount: 178
  },
  { 
    firstName: "James", 
    lastName: "Brown", 
    businessName: "Brown Oncology Center", 
    specialty: "Oncology",
    grade: "A+",
    rating: 4.9,
    reviewCount: 267
  }
];

export async function seedDemoData(userId: string) {
  try {
    // Create user profiles for providers
    const userProfiles = await Promise.all(
      providerProfiles.map(async (profile, index) => {
        const userProfile = {
          id: `provider_${index + 1}_${Date.now()}`,
          email: `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}@${profile.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
          firstName: profile.firstName,
          lastName: profile.lastName,
          userType: "provider",
          profileImageUrl: null
        };
        
        const [user] = await db.insert(users).values(userProfile).returning();
        return { ...profile, userId: user.id };
      })
    );

    // Create service providers with realistic data
    const demoProviders = userProfiles.map((profile, index) => ({
      userId: profile.userId,
      businessName: profile.businessName,
      licenseNumber: `VET-2024-${String(index + 1).padStart(3, '0')}`,
      specialties: [profile.specialty],
      address: `${(index + 1) * 123} ${['Main St', 'Oak Ave', 'Pine Rd', 'Elm Dr', 'Maple Ln', 'Cedar Blvd', 'Birch Way', 'Willow Ct'][index]}, Springfield, IL`,
      city: "Springfield",
      state: "IL",
      zipCode: `6270${index + 1}`,
      phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      website: `https://${profile.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
      description: getProviderDescription(profile.specialty, profile.grade),
      isVerified: true,
      rating: profile.rating.toString(),
      reviewCount: profile.reviewCount
    }));

    const insertedProviders = await db.insert(serviceProviders).values(demoProviders).returning();

    // Create quality metrics for each provider
    const qualityMetrics = insertedProviders.map((provider, index) => {
      const profile = userProfiles[index];
      const gradeToScore = {
        'A+': { clinical: 95, safety: 98, experience: 92, timeliness: 90, effectiveness: 94 },
        'A': { clinical: 88, safety: 91, experience: 87, timeliness: 85, effectiveness: 89 },
        'A-': { clinical: 82, safety: 85, experience: 80, timeliness: 78, effectiveness: 83 }
      };
      
      const scores = gradeToScore[profile.grade as keyof typeof gradeToScore];
      
      return {
        providerId: provider.id,
        overallRating: profile.rating.toString(),
        totalPatients: Math.floor(Math.random() * 500) + 200,
        totalProcedures: Math.floor(Math.random() * 1000) + 400,
        yearsOfExperience: Math.floor(Math.random() * 15) + 8,
        clinicalQualityScore: scores.clinical,
        patientSafetyScore: scores.safety,
        patientExperienceScore: scores.experience,
        timeliness: scores.timeliness,
        effectiveness: scores.effectiveness,
        successRate: (profile.rating * 20).toString(), // Convert 4.8 to 96%
        complicationRate: Math.max(1, (5 - profile.rating) * 2).toString(),
        readmissionRate: Math.max(0.5, (5 - profile.rating) * 1.5).toString(),
        emergencyResponseTime: Math.max(5, Math.floor((5 - profile.rating) * 30)),
        averageAppointmentWaitTime: Math.max(10, Math.floor((5 - profile.rating) * 20)),
        communicationRating: profile.rating.toString(),
        compassionRating: (profile.rating - 0.1 + Math.random() * 0.2).toString(),
        professionalismRating: profile.rating.toString(),
        recommendationRate: (profile.rating * 18 + 10).toString(),
        boardCertifications: getCertifications(profile.specialty),
        specialtyCertifications: [`Advanced ${profile.specialty}`, `${profile.specialty} Board Certification`],
        continuingEducationHours: Math.floor(Math.random() * 50) + 40,
        lastCertificationUpdate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        averageCostRating: (3.5 + Math.random() * 1.5).toString(),
        insuranceAcceptanceRate: (80 + Math.random() * 20).toString(),
        wheelchairAccessible: true,
        emergencyServices: profile.specialty === 'Emergency' || Math.random() > 0.5,
        telemedicineAvailable: Math.random() > 0.3,
        calculationPeriod: "12_months",
        dataPoints: profile.reviewCount
      };
    });

    await db.insert(providerQualityMetrics).values(qualityMetrics);

    // Create realistic reviews for top providers
    const reviewTemplates = [
      {
        rating: 5,
        title: "Exceptional Care and Expertise",
        comment: "Dr. {lastName} provided outstanding care for my pet. The diagnosis was accurate, treatment was effective, and the follow-up care was excellent. Highly recommended!"
      },
      {
        rating: 5,
        title: "Amazing Professional",
        comment: "The entire team at {businessName} is fantastic. They took great care of my furry family member and explained everything clearly. Will definitely return."
      },
      {
        rating: 4,
        title: "Great Experience",
        comment: "Very thorough examination and professional service. Dr. {lastName} was patient with all my questions and provided clear treatment options."
      },
      {
        rating: 5,
        title: "Lifesaving Treatment",
        comment: "Emergency visit that saved my pet's life. The quick response and expert care from Dr. {lastName} made all the difference. Forever grateful!"
      },
      {
        rating: 4,
        title: "Knowledgeable and Caring",
        comment: "Excellent specialist care. Dr. {lastName} has extensive knowledge in {specialty} and provided exactly the treatment my pet needed."
      }
    ];

    const reviewsData = [];
    for (let i = 0; i < insertedProviders.length; i++) {
      const provider = insertedProviders[i];
      const profile = userProfiles[i];
      const numReviews = Math.min(5, Math.floor(profile.reviewCount / 50)); // Create sample reviews
      
      for (let j = 0; j < numReviews; j++) {
        const template = reviewTemplates[j % reviewTemplates.length];
        reviewsData.push({
          providerId: provider.id,
          reviewerId: userId,
          rating: template.rating,
          title: template.title,
          comment: template.comment
            .replace('{lastName}', profile.lastName)
            .replace('{businessName}', profile.businessName)
            .replace('{specialty}', profile.specialty),
          serviceDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
          isRecommended: template.rating >= 4
        });
      }
    }

    if (reviewsData.length > 0) {
      await db.insert(reviews).values(reviewsData);
    }

    // Create demo pets
    const demoPets = [
      {
        ownerId: userId,
        name: "Buddy",
        species: "Dog",
        breed: "Golden Retriever",
        age: 5,
        weight: "68.5",
        color: "Golden",
        microchipId: "123456789012345",
        description: "Friendly and energetic golden retriever who loves playing fetch and swimming. Very social with other dogs and children.",
        emergencyContact: "Jane Smith - (555) 234-5678"
      },
      {
        ownerId: userId,
        name: "Whiskers",
        species: "Cat",
        breed: "Maine Coon",
        age: 3,
        weight: "12.2",
        color: "Gray and White",
        microchipId: "987654321098765",
        description: "Large, gentle Maine Coon with a calm temperament. Loves to be brushed and enjoys sunny windowsills.",
        emergencyContact: "John Doe - (555) 876-5432"
      },
      {
        ownerId: userId,
        name: "Luna",
        species: "Cat",
        breed: "British Shorthair",
        age: 2,
        weight: "8.8",
        color: "Blue",
        description: "Playful British Shorthair with beautiful blue coat. Very curious and loves interactive toys."
      }
    ];

    const insertedPets = await db.insert(pets).values(demoPets).returning();

    // Create demo medical records
    const demoRecords = [
      {
        petId: insertedPets[0].id, // Buddy
        recordType: "Vaccination",
        title: "Annual Vaccination Package",
        description: "Complete annual vaccination including DHPP, Rabies, and Bordetella. Pet showed excellent response with no adverse reactions.",
        veterinarian: "Dr. Sarah Johnson",
        clinic: "Happy Paws Veterinary Clinic",
        diagnosis: "Healthy - Preventive Care",
        treatment: "DHPP, Rabies, and Bordetella vaccinations administered",
        medications: "No medications prescribed",
        notes: "Next vaccination due in 12 months. Recommend dental cleaning in 6 months.",
        visitDate: new Date('2024-05-15'),
        followUpDate: new Date('2025-05-15')
      },
      {
        petId: insertedPets[0].id, // Buddy
        recordType: "Routine Checkup",
        title: "6-Month Wellness Exam",
        description: "Routine wellness examination including physical assessment, weight check, and general health evaluation.",
        veterinarian: "Dr. Michael Chen",
        clinic: "Happy Paws Veterinary Clinic",
        diagnosis: "Excellent health condition",
        treatment: "Routine examination, ear cleaning",
        medications: "Flea and tick prevention (monthly)",
        notes: "Pet is in excellent condition. Weight is ideal. Continue current diet and exercise routine.",
        visitDate: new Date('2024-11-20'),
        followUpDate: new Date('2025-05-20')
      },
      {
        petId: insertedPets[1].id, // Whiskers
        recordType: "Surgery",
        title: "Spay Surgery",
        description: "Routine spay surgery performed successfully. Pet recovered well from anesthesia with no complications.",
        veterinarian: "Dr. Emily Rodriguez",
        clinic: "Happy Paws Veterinary Clinic",
        diagnosis: "Routine spay procedure",
        treatment: "Ovariohysterectomy performed under general anesthesia",
        medications: "Pain medication (3 days), Antibiotic (7 days)",
        notes: "Surgery completed successfully. Keep incision clean and dry. Return in 10 days for suture removal.",
        visitDate: new Date('2024-03-10'),
        followUpDate: new Date('2024-03-20')
      },
      {
        petId: insertedPets[1].id, // Whiskers
        recordType: "Grooming",
        title: "Full Grooming Service",
        description: "Complete grooming service including bath, brush, nail trim, and ear cleaning. Cat was very cooperative.",
        veterinarian: "Professional Groomer Lisa Wang",
        clinic: "Pampered Pets Grooming Salon",
        diagnosis: "Routine grooming maintenance",
        treatment: "Full grooming package with nail trim",
        notes: "Beautiful coat condition. Recommend grooming every 8-10 weeks due to long fur.",
        visitDate: new Date('2024-10-05'),
        followUpDate: new Date('2024-12-05')
      },
      {
        petId: insertedPets[2].id, // Luna
        recordType: "Vaccination",
        title: "Kitten Vaccination Series - Final",
        description: "Final vaccination in kitten series. Luna has completed all required vaccinations and is fully protected.",
        veterinarian: "Dr. Sarah Johnson",
        clinic: "Happy Paws Veterinary Clinic",
        diagnosis: "Healthy kitten - vaccination complete",
        treatment: "FVRCP and Rabies vaccinations",
        medications: "No medications needed",
        notes: "Kitten vaccination series complete. Next annual vaccination due in 12 months.",
        visitDate: new Date('2024-08-12'),
        followUpDate: new Date('2025-08-12')
      }
    ];

    await db.insert(medicalRecords).values(demoRecords);

    console.log('Demo data seeded successfully!');
    return {
      pets: insertedPets.length,
      providers: insertedProviders.length,
      records: demoRecords.length
    };
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}