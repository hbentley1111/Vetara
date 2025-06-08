import { db } from './db';
import { pets, medicalRecords, serviceProviders, users } from '@shared/schema';

export async function seedDemoData(userId: string) {
  try {
    // First, create some demo service providers
    const demoProviders = [
      {
        userId: userId,
        businessName: "Happy Paws Veterinary Clinic",
        licenseNumber: "VET-2024-001",
        specialties: ["General Practice", "Surgery", "Dental Care"],
        address: "123 Main Street, Springfield, IL 62701",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        phone: "(555) 123-4567",
        website: "https://happypawsvet.com",
        description: "Full-service veterinary clinic providing comprehensive care for your beloved pets. Our experienced team offers routine checkups, emergency care, surgical procedures, and dental services.",
        isVerified: true,
        rating: "4.8",
        reviewCount: 127
      },
      {
        userId: userId,
        businessName: "Pampered Pets Grooming Salon",
        licenseNumber: "GROOM-2024-002",
        specialties: ["Full Grooming", "Nail Trimming", "Flea Treatment"],
        address: "456 Oak Avenue, Springfield, IL 62702",
        city: "Springfield",
        state: "IL",
        zipCode: "62702",
        phone: "(555) 987-6543",
        website: "https://pamperedpetsgrooming.com",
        description: "Professional pet grooming services with experienced groomers who treat your pets like family. We offer full grooming packages, nail care, and specialized treatments.",
        isVerified: true,
        rating: "4.9",
        reviewCount: 89
      },
      {
        userId: userId,
        businessName: "Emergency Animal Hospital",
        licenseNumber: "EMER-2024-003",
        specialties: ["Emergency Care", "Critical Care", "Surgery"],
        address: "789 Emergency Blvd, Springfield, IL 62703",
        city: "Springfield",
        state: "IL",
        zipCode: "62703",
        phone: "(555) 911-PETS",
        website: "https://emergencyanimalhosp.com",
        description: "24/7 emergency veterinary hospital equipped with state-of-the-art facilities and experienced emergency veterinarians ready to handle any pet emergency.",
        isVerified: true,
        rating: "4.7",
        reviewCount: 234
      }
    ];

    const insertedProviders = await db.insert(serviceProviders).values(demoProviders).returning();

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