import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { GooglePlacesService, convertGooglePlaceToServiceProvider } from "./googlePlaces";
import { insertPetSchema, insertMedicalRecordSchema, insertReviewSchema, insertAppointmentSchema } from "@shared/schema";
import { seedDemoData } from "./seedData";
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
      // Temporarily return mock user data due to database connection issues
      const user = {
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        userType: "pet_owner"
      };
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
      const userPets = await storage.getPetsByOwner(userId);
      res.json(userPets);
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

  // Delete medical record
  app.delete('/api/medical-records/:id', isAuthenticated, async (req: any, res) => {
    try {
      const recordId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const record = await storage.getMedicalRecordById(recordId);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      const pet = await storage.getPetById(record.petId);
      if (!pet || pet.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this record" });
      }

      await storage.deleteMedicalRecord(recordId);
      res.json({ message: "Medical record deleted successfully" });
    } catch (error) {
      console.error("Error deleting medical record:", error);
      res.status(500).json({ message: "Failed to delete medical record" });
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

  // Get top-rated providers (B+ and above)
  app.get('/api/service-providers/top-rated', async (req, res) => {
    try {
      const topProviders = await storage.getTopRatedProviders(10);
      res.json(topProviders);
    } catch (error) {
      console.error("Error fetching top-rated providers:", error);
      res.status(500).json({ message: "Failed to fetch top-rated providers" });
    }
  });

  // Provider quality metrics routes (Healthgrades-style grading system)
  app.get('/api/providers/:id/quality-metrics', isAuthenticated, async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const metrics = await storage.getProviderQualityMetrics(providerId);
      
      if (!metrics) {
        // Calculate metrics if they don't exist
        const calculatedMetrics = await storage.calculateProviderQualityMetrics(providerId);
        res.json(calculatedMetrics);
      } else {
        res.json(metrics);
      }
    } catch (error) {
      console.error("Error fetching provider quality metrics:", error);
      res.status(500).json({ message: "Failed to fetch quality metrics" });
    }
  });

  app.post('/api/providers/:id/calculate-metrics', isAuthenticated, async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const metrics = await storage.calculateProviderQualityMetrics(providerId);
      res.json(metrics);
    } catch (error) {
      console.error("Error calculating provider metrics:", error);
      res.status(500).json({ message: "Failed to calculate metrics" });
    }
  });

  app.get('/api/providers/:id/performance-history', isAuthenticated, async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const history = await storage.getProviderPerformanceHistory(providerId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching performance history:", error);
      res.status(500).json({ message: "Failed to fetch performance history" });
    }
  });

  app.get('/api/providers/:id/recognitions', isAuthenticated, async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const recognitions = await storage.getProviderRecognitions(providerId);
      res.json(recognitions);
    } catch (error) {
      console.error("Error fetching provider recognitions:", error);
      res.status(500).json({ message: "Failed to fetch recognitions" });
    }
  });

  // Provider search and ranking routes
  app.get('/api/providers/top-rated', async (req, res) => {
    try {
      const topProviders = await storage.getTopRatedProviders(10);
      res.json(topProviders);
    } catch (error) {
      console.error("Error fetching top-rated providers:", error);
      res.status(500).json({ message: "Failed to fetch top-rated providers" });
    }
  });

  app.get('/api/providers/by-specialty/:specialty', async (req, res) => {
    try {
      const specialty = req.params.specialty;
      const limit = parseInt(req.query.limit as string) || 10;
      const providers = await storage.getProvidersBySpecialty(specialty, limit);
      res.json(providers);
    } catch (error) {
      console.error("Error fetching providers by specialty:", error);
      res.status(500).json({ message: "Failed to fetch providers by specialty" });
    }
  });

  app.get('/api/providers/search-by-quality', async (req, res) => {
    try {
      const { city, minRating, specialty } = req.query;
      const providers = await storage.searchProvidersByQuality({
        city: city as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        specialty: specialty as string,
      });
      res.json(providers);
    } catch (error) {
      console.error("Error searching providers by quality:", error);
      res.status(500).json({ message: "Failed to search providers" });
    }
  });

  // Insurance routes
  app.get('/api/insurance/partners', isAuthenticated, async (req, res) => {
    try {
      const partners = await storage.getInsurancePartners();
      res.json(partners);
    } catch (error) {
      console.error("Error fetching insurance partners:", error);
      res.status(500).json({ message: "Failed to fetch insurance partners" });
    }
  });

  app.get('/api/insurance/policies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const policies = await storage.getPetInsurancePolicies(userId);
      res.json(policies);
    } catch (error) {
      console.error("Error fetching insurance policies:", error);
      res.status(500).json({ message: "Failed to fetch insurance policies" });
    }
  });

  app.get('/api/pets/:id/health-score', isAuthenticated, async (req: any, res) => {
    try {
      const petId = parseInt(req.params.id);
      const healthScore = await storage.calculateHealthScore(petId);
      res.json(healthScore);
    } catch (error) {
      console.error("Error calculating health score:", error);
      res.status(500).json({ message: "Failed to calculate health score" });
    }
  });

  // Demo data seeding endpoint
  app.post('/api/seed-demo-data', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const result = await seedDemoData(userId);
      res.json({ 
        message: "Demo data created successfully", 
        data: result 
      });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ message: "Failed to seed demo data" });
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
      const raw = await storage.getAppointmentsByOwner(userId);
      // Map Drizzle join format to flat structure the frontend expects
      const userAppointments = raw.map((row: any) => ({
        ...(row.appointments ?? row),
        pet: row.pets ?? row.pet,
        provider: row.service_providers
          ? { ...(row.service_providers), user: row.users }
          : row.provider,
      }));
      res.json(userAppointments);
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
      
      const userPets = await storage.getPetsByOwner(userId);
      const userAppointments = await storage.getAppointmentsByOwner(userId);
      const userRecords = await storage.getMedicalRecordsByOwner(userId);

      const now = new Date();
      const upcomingAppointments = userAppointments.filter(
        (a: any) => new Date(a.scheduledDate) > now && a.status === 'scheduled'
      ).length;

      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentCheckups = userRecords.filter(
        (r: any) => r.recordType === 'checkup' && new Date(r.visitDate) > thirtyDaysAgo
      ).length;

      const dueVaccinations = userRecords.filter(
        (r: any) => r.recordType === 'vaccination' && r.followUpDate && new Date(r.followUpDate) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      ).length;

      const stats = {
        totalPets: userPets.length,
        upcomingAppointments,
        recentCheckups,
        dueVaccinations: dueVaccinations || 0,
        trustedProviders: 5,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Provider portal routes
  app.get('/api/provider/pets', isAuthenticated, async (req: any, res) => {
    try {
      const providerId = req.user.claims.sub;
      const user = await storage.getUser(providerId);
      
      if (!user || (user.userType !== 'veterinarian' && user.userType !== 'groomer' && user.userType !== 'trainer')) {
        return res.status(403).json({ message: "Access denied. Provider account required." });
      }

      // Check subscription status
      if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trial') {
        return res.status(402).json({ message: "Active subscription required to access pet records." });
      }

      const authorizedPets = await storage.getAuthorizedPetsForProvider(providerId);
      res.json(authorizedPets);
    } catch (error) {
      console.error("Error fetching provider pets:", error);
      res.status(500).json({ message: "Failed to fetch authorized pets" });
    }
  });

  app.get('/api/provider/pet/:petId/records', isAuthenticated, async (req: any, res) => {
    try {
      const providerId = req.user.claims.sub;
      const petId = parseInt(req.params.petId);
      
      const hasAccess = await storage.checkProviderAccess(providerId, petId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this pet's records." });
      }

      const records = await storage.getMedicalRecordsByPet(petId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching pet records:", error);
      res.status(500).json({ message: "Failed to fetch pet medical records" });
    }
  });

  app.post('/api/provider/access/grant', isAuthenticated, async (req: any, res) => {
    try {
      const ownerId = req.user.claims.sub;
      const { petId, providerId, accessLevel, accessReason, expiresAt } = req.body;
      
      // Verify pet ownership
      const pet = await storage.getPetById(petId);
      if (!pet || pet.ownerId !== ownerId) {
        return res.status(403).json({ message: "You can only grant access to your own pets." });
      }

      const access = await storage.grantProviderAccess({
        petId,
        providerId,
        ownerId,
        accessLevel: accessLevel || 'read',
        accessReason,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      res.json(access);
    } catch (error) {
      console.error("Error granting provider access:", error);
      res.status(500).json({ message: "Failed to grant provider access" });
    }
  });

  app.post('/api/provider/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const providerId = req.user.claims.sub;
      const { subscriptionTier, monthlyFee, petsAccessLimit } = req.body;
      
      const subscription = await storage.createProviderSubscription({
        providerId,
        subscriptionTier: subscriptionTier || 'basic',
        monthlyFee: monthlyFee || '29.99',
        petsAccessLimit: petsAccessLimit || 50,
        status: 'trial',
        billingCycle: 'monthly',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      res.json(subscription);
    } catch (error) {
      console.error("Error creating provider subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Medical search - PubMed proxy
  app.get('/api/medical-search', isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=15&sort=relevance`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      const ids = searchData?.esearchresult?.idlist || [];
      const totalResults = parseInt(searchData?.esearchresult?.count || "0");

      if (ids.length === 0) {
        return res.json({ articles: [], totalResults: 0 });
      }

      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
      const summaryRes = await fetch(summaryUrl);
      const summaryData = await summaryRes.json();

      const articles = ids.map((id: string) => {
        const item = summaryData?.result?.[id];
        if (!item) return null;
        return {
          uid: item.uid,
          title: item.title || "Untitled",
          authors: item.authors?.map((a: any) => a.name) || [],
          source: item.source || "",
          pubdate: item.pubdate || "",
          description: item.description || item.sorttitle || "",
          pubtype: item.pubtype || [],
          volume: item.volume || "",
          issue: item.issue || "",
          pages: item.pages || "",
        };
      }).filter(Boolean);

      res.json({ articles, totalResults });
    } catch (error) {
      console.error("Error searching PubMed:", error);
      res.status(500).json({ message: "Failed to search medical literature" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
