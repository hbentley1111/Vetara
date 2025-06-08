import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { GooglePlacesService, convertGooglePlaceToServiceProvider } from "./googlePlaces";
import { insertPetSchema, insertMedicalRecordSchema, insertReviewSchema, insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import QRCode from "qrcode";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Pet routes
  app.get('/api/pets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pets = await storage.getPetsByOwner(userId);
      res.json(pets);
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  app.post('/api/pets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petData = insertPetSchema.parse({ ...req.body, ownerId: userId });
      const pet = await storage.createPet(petData);
      res.json(pet);
    } catch (error) {
      console.error("Error creating pet:", error);
      res.status(400).json({ message: "Failed to create pet" });
    }
  });

  app.put('/api/pets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const petId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const existingPet = await storage.getPetById(petId);
      if (!existingPet || existingPet.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this pet" });
      }

      const petData = insertPetSchema.partial().parse(req.body);
      const pet = await storage.updatePet(petId, petData);
      res.json(pet);
    } catch (error) {
      console.error("Error updating pet:", error);
      res.status(400).json({ message: "Failed to update pet" });
    }
  });

  app.delete('/api/pets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const petId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const existingPet = await storage.getPetById(petId);
      if (!existingPet || existingPet.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this pet" });
      }

      await storage.deletePet(petId);
      res.json({ message: "Pet deleted successfully" });
    } catch (error) {
      console.error("Error deleting pet:", error);
      res.status(500).json({ message: "Failed to delete pet" });
    }
  });

  // QR Code generation
  app.post('/api/pets/:id/qr', isAuthenticated, async (req: any, res) => {
    try {
      const petId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const existingPet = await storage.getPetById(petId);
      if (!existingPet || existingPet.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to generate QR for this pet" });
      }

      // Generate QR code with pet information URL
      const petUrl = `${req.protocol}://${req.get('host')}/pet/${petId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(petUrl);
      
      res.json({ qrCode: qrCodeDataUrl, petUrl });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Public pet info route (for QR code scanning)
  app.get('/api/pet/:id/public', async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      const pet = await storage.getPetById(petId);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }

      // Return only public information
      const publicInfo = {
        name: pet.name,
        breed: pet.breed,
        species: pet.species,
        color: pet.color,
        photoUrl: pet.photoUrl,
        microchipId: pet.microchipId,
      };

      res.json(publicInfo);
    } catch (error) {
      console.error("Error fetching public pet info:", error);
      res.status(500).json({ message: "Failed to fetch pet information" });
    }
  });

  // Medical records routes
  app.get('/api/medical-records', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const records = await storage.getMedicalRecordsByOwner(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      res.status(500).json({ message: "Failed to fetch medical records" });
    }
  });

  app.get('/api/pets/:petId/medical-records', isAuthenticated, async (req: any, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const pet = await storage.getPetById(petId);
      if (!pet || pet.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to access these records" });
      }

      const records = await storage.getMedicalRecordsByPet(petId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching pet medical records:", error);
      res.status(500).json({ message: "Failed to fetch medical records" });
    }
  });

  app.post('/api/medical-records', isAuthenticated, upload.array('attachments', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.body.petId);
      
      // Verify ownership
      const pet = await storage.getPetById(petId);
      if (!pet || pet.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to add records for this pet" });
      }

      // Handle file uploads
      const attachments = req.files ? req.files.map((file: any) => file.path) : [];

      const recordData = insertMedicalRecordSchema.parse({
        ...req.body,
        petId,
        attachments,
        visitDate: new Date(req.body.visitDate),
        followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : undefined,
      });

      const record = await storage.createMedicalRecord(recordData);
      res.json(record);
    } catch (error) {
      console.error("Error creating medical record:", error);
      res.status(400).json({ message: "Failed to create medical record" });
    }
  });

  // Service providers routes with Google Places integration
  app.get('/api/service-providers', async (req, res) => {
    try {
      const { city, specialty, userType, lat, lng, radius, includeGoogle } = req.query;
      
      let providers = await storage.getServiceProviders({
        city: city as string,
        specialty: specialty as string,
        userType: userType as string,
      });

      // If Google Places integration is requested and API key is available
      if (includeGoogle === 'true' && process.env.GOOGLE_PLACES_API_KEY) {
        try {
          const googlePlaces = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);
          let googleResults: any[] = [];

          if (lat && lng) {
            // Search by location
            const latitude = parseFloat(lat as string);
            const longitude = parseFloat(lng as string);
            const searchRadius = radius ? parseInt(radius as string) : 5000;

            if (specialty === 'Veterinarian' || !specialty) {
              const vets = await googlePlaces.searchNearbyVeterinarians(latitude, longitude, searchRadius);
              googleResults.push(...vets);
            }
            if (specialty === 'Groomer' || !specialty) {
              const groomers = await googlePlaces.searchNearbyPetGroomers(latitude, longitude, searchRadius);
              googleResults.push(...groomers);
            }
            if (specialty === 'Pet Store' || !specialty) {
              const stores = await googlePlaces.searchNearbyPetStores(latitude, longitude, searchRadius);
              googleResults.push(...stores);
            }
          } else if (city) {
            // Search by city
            const searchType = specialty === 'Veterinarian' ? 'veterinary_care' : 
                             specialty === 'Groomer' ? 'pet_grooming' : 'pet_store';
            googleResults = await googlePlaces.searchByCity(city as string, searchType);
          }

          // Convert Google Places results to our format
          const convertedResults = googleResults.map((place, index) => {
            const converted = convertGooglePlaceToServiceProvider(place, 'google_user');
            return {
              id: -(index + 1), // Use negative IDs for Google Places to avoid conflicts
              ...converted,
              user: {
                id: 'google_user',
                email: null,
                firstName: 'Google',
                lastName: 'Places',
                profileImageUrl: null,
                userType: 'provider',
                createdAt: new Date(),
                updatedAt: new Date()
              },
              isGooglePlace: true,
              googlePlaceId: place.place_id
            };
          });

          // Merge with existing providers
          providers = [...providers, ...convertedResults];
        } catch (googleError) {
          console.error('Google Places API error:', googleError);
          // Continue with local providers only
        }
      }

      res.json(providers);
    } catch (error) {
      console.error("Error fetching service providers:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  // Get Google Place details
  app.get('/api/google-place/:placeId', async (req, res) => {
    try {
      if (!process.env.GOOGLE_PLACES_API_KEY) {
        return res.status(400).json({ message: "Google Places API not configured" });
      }

      const googlePlaces = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);
      const placeDetails = await googlePlaces.getPlaceDetails(req.params.placeId);
      
      res.json(placeDetails);
    } catch (error) {
      console.error("Error fetching Google Place details:", error);
      res.status(500).json({ message: "Failed to fetch place details" });
    }
  });

  app.get('/api/service-providers/:id', async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const provider = await storage.getServiceProviderById(providerId);
      
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }

      res.json(provider);
    } catch (error) {
      console.error("Error fetching service provider:", error);
      res.status(500).json({ message: "Failed to fetch service provider" });
    }
  });

  // Reviews routes
  app.get('/api/service-providers/:id/reviews', async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByProvider(providerId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        reviewerId: userId,
        serviceDate: req.body.serviceDate ? new Date(req.body.serviceDate) : undefined,
      });

      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  // Appointments routes
  app.get('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appointments = await storage.getAppointmentsByOwner(userId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.body.petId);
      
      // Verify ownership
      const pet = await storage.getPetById(petId);
      if (!pet || pet.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to schedule appointments for this pet" });
      }

      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        petId,
        scheduledDate: new Date(req.body.scheduledDate),
      });

      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(400).json({ message: "Failed to create appointment" });
    }
  });

  // Dashboard stats route
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const pets = await storage.getPetsByOwner(userId);
      const appointments = await storage.getAppointmentsByOwner(userId);
      const records = await storage.getMedicalRecordsByOwner(userId);
      
      // Calculate stats
      const totalPets = pets.length;
      const upcomingAppointments = appointments.filter(
        apt => apt.scheduledDate > new Date() && apt.status === 'scheduled'
      ).length;
      const recentCheckups = records.filter(
        record => record.visitDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;
      
      // Calculate vaccination status
      const vaccinationRecords = records.filter(
        record => record.recordType === 'vaccination'
      );
      const dueVaccinations = pets.filter(pet => {
        const lastVaccination = vaccinationRecords
          .filter(record => record.petId === pet.id)
          .sort((a, b) => b.visitDate.getTime() - a.visitDate.getTime())[0];
        
        if (!lastVaccination) return true;
        
        // Consider vaccination due if more than 1 year old
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return lastVaccination.visitDate < oneYearAgo;
      }).length;

      const stats = {
        totalPets,
        upcomingAppointments,
        recentCheckups,
        dueVaccinations,
        trustedProviders: 0, // Can be calculated from reviews/appointments
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
