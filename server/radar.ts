import { storage } from "./storage";

interface RadarPlace {
  _id: string;
  name: string;
  categories: string[];
  chain?: {
    name: string;
    slug: string;
  };
  location: {
    coordinates: [number, number];
  };
  address: {
    formattedAddress: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  phone?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  hours?: {
    [key: string]: string;
  };
}

interface RadarSearchResponse {
  places: RadarPlace[];
  meta: {
    code: number;
  };
}

const RADAR_SECRET_KEY = process.env.RADAR_SECRET_KEY;

if (!RADAR_SECRET_KEY) {
  console.warn("RADAR_SECRET_KEY not found. Radar integration will not work.");
}

// Pet care related categories for Radar search
const PET_CARE_CATEGORIES = [
  'veterinary-clinic',
  'animal-hospital', 
  'pet-grooming',
  'pet-store',
  'pet-supply-store',
  'veterinarian',
  'pet-boarding',
  'pet-daycare',
  'pet-training'
];

export class RadarService {
  private readonly baseUrl = 'https://api.radar.io/v1';
  private readonly secretKey: string;

  constructor() {
    if (!RADAR_SECRET_KEY) {
      throw new Error('RADAR_SECRET_KEY is required');
    }
    this.secretKey = RADAR_SECRET_KEY;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': this.secretKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Radar API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchPetCareBusinesses(
    latitude: number,
    longitude: number,
    radius: number = 10000, // 10km default
    limit: number = 50
  ): Promise<RadarPlace[]> {
    try {
      const params = {
        near: `${latitude},${longitude}`,
        radius: radius.toString(),
        limit: limit.toString(),
        categories: PET_CARE_CATEGORIES.join(','),
      };

      const response: RadarSearchResponse = await this.makeRequest('/search/places', params);
      return response.places || [];
    } catch (error) {
      console.error('Error searching pet care businesses:', error);
      return [];
    }
  }

  async searchByCity(
    city: string,
    state?: string,
    limit: number = 50
  ): Promise<RadarPlace[]> {
    try {
      const query = state ? `${city}, ${state}` : city;
      const params = {
        query,
        limit: limit.toString(),
        categories: PET_CARE_CATEGORIES.join(','),
      };

      const response: RadarSearchResponse = await this.makeRequest('/search/places', params);
      return response.places || [];
    } catch (error) {
      console.error('Error searching by city:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<RadarPlace | null> {
    try {
      const response = await this.makeRequest(`/places/${placeId}`);
      return response.place || null;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  // Convert Radar place to our service provider format
  convertToServiceProvider(place: RadarPlace, userId: string) {
    // Determine provider type based on categories
    let providerType = 'other';
    let specialty = 'General Pet Care';

    if (place.categories.some(cat => cat.includes('veterinary') || cat.includes('animal-hospital'))) {
      providerType = 'veterinarian';
      specialty = 'Veterinary Medicine';
    } else if (place.categories.some(cat => cat.includes('grooming'))) {
      providerType = 'groomer';
      specialty = 'Pet Grooming';
    } else if (place.categories.some(cat => cat.includes('boarding') || cat.includes('daycare'))) {
      providerType = 'boarding';
      specialty = 'Pet Boarding & Daycare';
    } else if (place.categories.some(cat => cat.includes('training'))) {
      providerType = 'trainer';
      specialty = 'Pet Training';
    } else if (place.categories.some(cat => cat.includes('store') || cat.includes('supply'))) {
      providerType = 'store';
      specialty = 'Pet Supplies';
    }

    return {
      userId,
      businessName: place.name,
      userType: providerType,
      specialty,
      description: `${specialty} services provided by ${place.name}`,
      address: place.address?.formattedAddress || place.address?.street || 'Address not available',
      city: place.address?.city || place.address?.state || '',
      phone: place.phone || null,
      website: place.website || null,
      socialMedia: JSON.stringify({
        facebook: place.facebook,
        instagram: place.instagram,
        twitter: place.twitter,
      }),
      specialties: [specialty],
      isVerified: true, // Radar places are considered verified
      latitude: place.location.coordinates[1].toString(),
      longitude: place.location.coordinates[0].toString(),
      radarPlaceId: place._id,
    };
  }

  // Import places and create service providers
  async importServiceProviders(
    latitude: number,
    longitude: number,
    radius: number = 10000
  ): Promise<{ imported: number; errors: number }> {
    let imported = 0;
    let errors = 0;

    try {
      const places = await this.searchPetCareBusinesses(latitude, longitude, radius);
      
      for (const place of places) {
        try {
          // Create a user account for this business
          const user = await storage.upsertUser({
            id: `radar_${place._id}`,
            email: place.website ? `contact@${new URL(place.website).hostname}` : null,
            firstName: place.name.split(' ')[0],
            lastName: place.name.split(' ').slice(1).join(' ') || 'Business',
            profileImageUrl: null,
          });

          // Create service provider
          const providerData = this.convertToServiceProvider(place, user.id);
          await storage.createServiceProvider(providerData);
          
          imported++;
        } catch (error) {
          console.error(`Error importing place ${place.name}:`, error);
          errors++;
        }
      }
    } catch (error) {
      console.error('Error during import process:', error);
      errors++;
    }

    return { imported, errors };
  }
}

export const radarService = RADAR_SECRET_KEY ? new RadarService() : null;