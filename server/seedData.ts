import { db } from './db';
import { pets, medicalRecords, serviceProviders, users, providerQualityMetrics, reviews, insurancePartners, appointments } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
    grade: "A",
    rating: 4.7,
    reviewCount: 189
  },
  { 
    firstName: "James", 
    lastName: "Wilson", 
    businessName: "Wilson Pet Oncology Center",
    specialty: "Oncology",
    grade: "A+",
    rating: 4.9,
    reviewCount: 98
  },
  { 
    firstName: "Amanda", 
    lastName: "Brown", 
    businessName: "Brown Mobile Veterinary",
    specialty: "General Practice",
    grade: "B+",
    rating: 4.4,
    reviewCount: 156
  },
  { 
    firstName: "Christopher", 
    lastName: "Garcia", 
    businessName: "Garcia 24/7 Animal Hospital",
    specialty: "Emergency",
    grade: "B+",
    rating: 4.3,
    reviewCount: 278
  },
  { 
    firstName: "Rachel", 
    lastName: "Martinez", 
    businessName: "Martinez Holistic Pet Care",
    specialty: "General Practice",
    grade: "B+",
    rating: 4.2,
    reviewCount: 145
  },
  { 
    firstName: "Kevin", 
    lastName: "Lee", 
    businessName: "Lee Emergency Animal Care",
    specialty: "Emergency",
    grade: "B",
    rating: 4.1,
    reviewCount: 203
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

    // Create comprehensive demo medical records
    const demoRecords = [
      // Buddy (Golden Retriever) - Complete medical history
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
        followUpDate: new Date('2025-05-15'),
        cost: "125.00"
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
        followUpDate: new Date('2025-05-20'),
        cost: "85.00"
      },
      {
        petId: insertedPets[0].id, // Buddy
        recordType: "Emergency",
        title: "Porcupine Quill Removal",
        description: "Emergency visit for removal of porcupine quills from face and paws. Multiple quills removed under sedation.",
        veterinarian: "Dr. Emily Rodriguez",
        clinic: "Rodriguez Emergency Veterinary",
        diagnosis: "Porcupine quill injury - face and paws",
        treatment: "Sedation and quill removal, wound cleaning, antibiotic injection",
        medications: "Amoxicillin 500mg twice daily for 10 days, Rimadyl 50mg once daily for 5 days",
        notes: "All quills successfully removed. Watch for signs of infection. Keep activity limited for 3 days.",
        visitDate: new Date('2024-09-03'),
        followUpDate: new Date('2024-09-10'),
        isEmergency: true,
        cost: "385.00"
      },
      {
        petId: insertedPets[0].id, // Buddy
        recordType: "Dental",
        title: "Professional Dental Cleaning",
        description: "Annual dental cleaning with examination under anesthesia. One tooth extraction required.",
        veterinarian: "Dr. Robert Davis",
        clinic: "Davis Dental Veterinary",
        diagnosis: "Mild periodontal disease, one damaged tooth",
        treatment: "Dental scaling, polishing, tooth extraction (upper left premolar)",
        medications: "Pain medication for 3 days post-procedure",
        notes: "Dental health overall good. Recommend daily teeth brushing and dental chews.",
        visitDate: new Date('2024-01-22'),
        followUpDate: new Date('2025-01-22'),
        cost: "450.00"
      },
      {
        petId: insertedPets[0].id, // Buddy
        recordType: "Lab Work",
        title: "Annual Blood Panel",
        description: "Comprehensive blood chemistry panel and complete blood count for annual wellness screening.",
        veterinarian: "Dr. Sarah Johnson",
        clinic: "Happy Paws Veterinary Clinic",
        diagnosis: "All values within normal limits",
        treatment: "Blood draw and laboratory analysis",
        medications: "None required",
        notes: "Excellent blood work results. All organ functions normal. Continue current care regimen.",
        visitDate: new Date('2024-05-15'),
        cost: "95.00"
      },

      // Whiskers (Maine Coon) - Medical history
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
        followUpDate: new Date('2024-03-20'),
        cost: "275.00"
      },
      {
        petId: insertedPets[1].id, // Whiskers
        recordType: "Grooming",
        title: "Full Grooming Service",
        description: "Complete grooming service including bath, brush out, nail trim, and ear cleaning for long-haired breed.",
        veterinarian: "Professional Groomer - Lisa",
        clinic: "Happy Paws Veterinary Clinic",
        diagnosis: "Routine grooming - healthy coat",
        treatment: "Bath, thorough brush out, nail trim, ear cleaning",
        medications: "None",
        notes: "Beautiful coat condition. Regular brushing at home recommended to prevent matting.",
        visitDate: new Date('2024-10-05'),
        followUpDate: new Date('2025-01-05'),
        cost: "65.00"
      },
      {
        petId: insertedPets[1].id, // Whiskers
        recordType: "Vaccination",
        title: "Core Vaccinations - FVRCP",
        description: "Annual core vaccinations for indoor cat including FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia).",
        veterinarian: "Dr. David Johnson",
        clinic: "Johnson Family Pet Care",
        diagnosis: "Healthy - Preventive Care",
        treatment: "FVRCP vaccination administered",
        medications: "None required",
        notes: "Excellent response to vaccination. Continue indoor lifestyle. Next vaccination due in 12 months.",
        visitDate: new Date('2024-04-18'),
        followUpDate: new Date('2025-04-18'),
        cost: "85.00"
      },
      {
        petId: insertedPets[1].id, // Whiskers
        recordType: "Routine Checkup",
        title: "Annual Wellness Examination",
        description: "Comprehensive annual health examination including physical assessment and weight monitoring.",
        veterinarian: "Dr. Jennifer Miller",
        clinic: "Miller Dermatology for Pets",
        diagnosis: "Excellent health, minor skin sensitivity noted",
        treatment: "Complete physical examination, skin assessment",
        medications: "Hypoallergenic shampoo recommended",
        notes: "Overall excellent health. Minor skin sensitivity - recommend limited ingredient diet trial.",
        visitDate: new Date('2024-08-12'),
        followUpDate: new Date('2025-08-12'),
        cost: "75.00"
      },
      {
        petId: insertedPets[1].id, // Whiskers
        recordType: "Diagnostic",
        title: "Skin Allergy Testing",
        description: "Comprehensive skin allergy testing due to mild dermatitis symptoms and excessive grooming behavior.",
        veterinarian: "Dr. Jennifer Miller",
        clinic: "Miller Dermatology for Pets",
        diagnosis: "Mild environmental allergies - dust mites and pollen",
        treatment: "Intradermal allergy testing, consultation on management",
        medications: "Antihistamine as needed, hypoallergenic diet",
        notes: "Positive reactions to common environmental allergens. Management plan developed for long-term comfort.",
        visitDate: new Date('2024-09-20'),
        followUpDate: new Date('2024-12-20'),
        cost: "320.00"
      },

      // Luna (British Shorthair) - Medical history
      {
        petId: insertedPets[2].id, // Luna
        recordType: "Vaccination",
        title: "Kitten Vaccination Series - Final",
        description: "Final vaccination in kitten series including FVRCP and first rabies vaccination.",
        veterinarian: "Dr. Sarah Johnson",
        clinic: "Happy Paws Veterinary Clinic",
        diagnosis: "Healthy kitten - completing vaccination series",
        treatment: "FVRCP booster and first rabies vaccination",
        medications: "None required",
        notes: "Completed kitten vaccination series successfully. Next annual vaccinations due in 12 months.",
        visitDate: new Date('2024-06-10'),
        followUpDate: new Date('2025-06-10'),
        cost: "110.00"
      },
      {
        petId: insertedPets[2].id, // Luna
        recordType: "Routine Checkup",
        title: "6-Month Kitten Check",
        description: "Six-month wellness examination to monitor growth and development in young cat.",
        veterinarian: "Dr. Michael Chen",
        clinic: "Happy Paws Veterinary Clinic",
        diagnosis: "Healthy development, ideal weight for age",
        treatment: "Physical examination, growth assessment, nutritional counseling",
        medications: "None required",
        notes: "Excellent growth and development. Continue current kitten food until 12 months of age.",
        visitDate: new Date('2024-08-25'),
        followUpDate: new Date('2025-02-25'),
        cost: "65.00"
      },
      {
        petId: insertedPets[2].id, // Luna
        recordType: "Surgery",
        title: "Spay Surgery - Young Adult",
        description: "Elective spay surgery performed at appropriate age. Procedure completed without complications.",
        veterinarian: "Dr. Michael Chen",
        clinic: "Chen Animal Medical Center",
        diagnosis: "Routine spay procedure",
        treatment: "Ovariohysterectomy under general anesthesia",
        medications: "Pain management for 5 days, antibiotic course",
        notes: "Surgery successful. Patient recovered well. Suture removal scheduled for 10-14 days post-op.",
        visitDate: new Date('2024-11-08'),
        followUpDate: new Date('2024-11-18'),
        cost: "285.00"
      },
      {
        petId: insertedPets[2].id, // Luna
        recordType: "Emergency",
        title: "Foreign Object Ingestion",
        description: "Emergency presentation for ingestion of small toy. X-rays confirmed object in stomach.",
        veterinarian: "Dr. Christopher Garcia",
        clinic: "Garcia 24/7 Animal Hospital",
        diagnosis: "Foreign body ingestion - small rubber toy",
        treatment: "Induced vomiting successfully retrieved object, IV fluids, monitoring",
        medications: "Anti-nausea medication, gastric protectant for 3 days",
        notes: "Object successfully removed by induced vomiting. Monitor appetite and eliminate foreign objects from environment.",
        visitDate: new Date('2024-09-15'),
        followUpDate: new Date('2024-09-18'),
        isEmergency: true,
        cost: "195.00"
      },
      {
        petId: insertedPets[2].id, // Luna
        recordType: "Diagnostic",
        title: "Pre-Surgical Blood Work",
        description: "Pre-anesthetic blood panel to ensure safety for upcoming spay surgery.",
        veterinarian: "Dr. Michael Chen",
        clinic: "Chen Animal Medical Center",
        diagnosis: "All parameters normal for surgery",
        treatment: "Complete blood count and chemistry panel",
        medications: "None required",
        notes: "Excellent blood work results. Patient cleared for anesthesia and surgery.",
        visitDate: new Date('2024-11-05'),
        cost: "85.00"
      }
    ];

    await db.insert(medicalRecords).values(demoRecords);

    // Create upcoming appointments (future dates relative to now)
    const now = new Date();
    const daysFromNow = (days: number, hour = 10, minute = 0) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      d.setHours(hour, minute, 0, 0);
      return d;
    };

    const demoAppointments = [
      {
        petId: insertedPets[0].id, // Buddy
        providerId: insertedProviders[0].id, // Thompson Veterinary Excellence (Cardiology)
        appointmentType: "Routine Checkup",
        scheduledDate: daysFromNow(5, 9, 0),
        duration: 45,
        status: "confirmed",
        notes: "Annual wellness exam. Bring previous vaccination records. Buddy has been eating well and seems energetic."
      },
      {
        petId: insertedPets[0].id, // Buddy
        providerId: insertedProviders[5].id, // Davis Dental Veterinary
        appointmentType: "Dental",
        scheduledDate: daysFromNow(14, 10, 30),
        duration: 90,
        status: "scheduled",
        notes: "Follow-up dental cleaning appointment. Monitor gum line from last visit."
      },
      {
        petId: insertedPets[1].id, // Whiskers
        providerId: insertedProviders[6].id, // Miller Dermatology for Pets
        appointmentType: "Dermatology Follow-Up",
        scheduledDate: daysFromNow(7, 14, 0),
        duration: 30,
        status: "confirmed",
        notes: "Follow-up on allergy treatment plan. Check skin condition and adjust antihistamine dose if needed."
      },
      {
        petId: insertedPets[1].id, // Whiskers
        providerId: insertedProviders[3].id, // Johnson Family Pet Care
        appointmentType: "Vaccination",
        scheduledDate: daysFromNow(21, 11, 0),
        duration: 30,
        status: "scheduled",
        notes: "Annual FVRCP booster vaccination. Indoor cat - no rabies required this cycle."
      },
      {
        petId: insertedPets[2].id, // Luna
        providerId: insertedProviders[1].id, // Chen Animal Medical Center
        appointmentType: "Post-Surgery Follow-Up",
        scheduledDate: daysFromNow(3, 15, 30),
        duration: 30,
        status: "confirmed",
        notes: "10-day post-spay suture check. Inspect incision site and remove sutures if healed properly."
      },
      {
        petId: insertedPets[2].id, // Luna
        providerId: insertedProviders[3].id, // Johnson Family Pet Care
        appointmentType: "Routine Checkup",
        scheduledDate: daysFromNow(30, 9, 30),
        duration: 45,
        status: "scheduled",
        notes: "6-month wellness check for Luna. Growth assessment and nutritional review for young adult cat."
      }
    ];

    await db.insert(appointments).values(demoAppointments);

    console.log('Demo data seeded successfully!');
    return {
      pets: insertedPets.length,
      providers: insertedProviders.length,
      records: demoRecords.length,
      appointments: demoAppointments.length
    };
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}

export async function seedInsurancePartners() {
  const existing = await db.select().from(insurancePartners);
  if (existing.length > 0) return;

  const partners = [
    {
      companyName: "PawGuard Insurance",
      partnerCode: "PAWGUARD",
      description: "Comprehensive pet insurance with flexible plans for dogs and cats. Covers accidents, illnesses, and preventive care with no breed restrictions.",
      websiteUrl: "https://pawguard.example.com",
      contactEmail: "partners@pawguard.example.com",
      contactPhone: "(800) 555-7291",
      isActive: true,
      baseDiscountRate: "8.00",
      maxDiscountRate: "28.00",
      commissionRate: "3.50",
    },
    {
      companyName: "VetShield Pro",
      partnerCode: "VETSHIELD",
      description: "Premium veterinary insurance trusted by over 500,000 pet owners. Offers 90% reimbursement on covered costs with fast claims processing.",
      websiteUrl: "https://vetshield.example.com",
      contactEmail: "support@vetshield.example.com",
      contactPhone: "(800) 555-4810",
      isActive: true,
      baseDiscountRate: "10.00",
      maxDiscountRate: "30.00",
      commissionRate: "4.00",
    },
    {
      companyName: "HappyPet Coverage",
      partnerCode: "HAPPYPET",
      description: "Affordable multi-pet insurance plans with wellness add-ons. Reward pet owners for keeping up with preventive care and annual checkups.",
      websiteUrl: "https://happypet.example.com",
      contactEmail: "hello@happypet.example.com",
      contactPhone: "(800) 555-3392",
      isActive: true,
      baseDiscountRate: "5.00",
      maxDiscountRate: "22.00",
      commissionRate: "3.00",
    },
    {
      companyName: "CareFirst Pets",
      partnerCode: "CAREFIRST",
      description: "Nationally recognized pet insurer offering customizable deductibles and annual limits. Specialized plans for senior pets and chronic conditions.",
      websiteUrl: "https://carefirst.example.com",
      contactEmail: "info@carefirst.example.com",
      contactPhone: "(800) 555-6624",
      isActive: true,
      baseDiscountRate: "7.00",
      maxDiscountRate: "25.00",
      commissionRate: "3.25",
    },
    {
      companyName: "TailSafe Insurance",
      partnerCode: "TAILSAFE",
      description: "Innovative digital-first pet insurance with an AI-powered claims app. Real-time claim status, direct vet billing, and instant policy updates.",
      websiteUrl: "https://tailsafe.example.com",
      contactEmail: "claims@tailsafe.example.com",
      contactPhone: "(800) 555-9047",
      isActive: true,
      baseDiscountRate: "6.00",
      maxDiscountRate: "26.00",
      commissionRate: "3.75",
    },
    {
      companyName: "FureverSafe",
      partnerCode: "FUREVER",
      description: "Boutique pet insurance focused on holistic and alternative care coverage including acupuncture, chiropractic, and hydrotherapy treatments.",
      websiteUrl: "https://fureverSafe.example.com",
      contactEmail: "care@furever.example.com",
      contactPhone: "(800) 555-2218",
      isActive: true,
      baseDiscountRate: "5.00",
      maxDiscountRate: "20.00",
      commissionRate: "2.75",
    },
  ];

  await db.insert(insurancePartners).values(partners);
  console.log(`Seeded ${partners.length} insurance partners.`);
}