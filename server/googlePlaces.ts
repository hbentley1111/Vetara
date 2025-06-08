interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  formatted_phone_number?: string;
  website?: string;
  types: string[];
}

interface GooglePlaceDetails extends GooglePlaceResult {
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
    profile_photo_url: string;
  }>;
}

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchNearbyVeterinarians(lat: number, lng: number, radius = 5000): Promise<GooglePlaceResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    const url = `${this.baseUrl}/nearbysearch/json`;
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: radius.toString(),
      type: 'veterinary_care',
      key: this.apiKey
    });

    try {
      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.results;
    } catch (error) {
      console.error('Error fetching veterinarians from Google Places:', error);
      throw error;
    }
  }

  async searchNearbyPetGroomers(lat: number, lng: number, radius = 5000): Promise<GooglePlaceResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    const url = `${this.baseUrl}/textsearch/json`;
    const params = new URLSearchParams({
      query: 'pet grooming',
      location: `${lat},${lng}`,
      radius: radius.toString(),
      key: this.apiKey
    });

    try {
      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.results;
    } catch (error) {
      console.error('Error fetching pet groomers from Google Places:', error);
      throw error;
    }
  }

  async searchNearbyPetStores(lat: number, lng: number, radius = 5000): Promise<GooglePlaceResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    const url = `${this.baseUrl}/nearbysearch/json`;
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: radius.toString(),
      type: 'pet_store',
      key: this.apiKey
    });

    try {
      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.results;
    } catch (error) {
      console.error('Error fetching pet stores from Google Places:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    const url = `${this.baseUrl}/details/json`;
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'name,formatted_address,geometry,rating,user_ratings_total,formatted_phone_number,website,opening_hours,reviews,photos,price_level',
      key: this.apiKey
    });

    try {
      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.result;
    } catch (error) {
      console.error('Error fetching place details from Google Places:', error);
      throw error;
    }
  }

  async searchByCity(city: string, type: 'veterinary_care' | 'pet_grooming' | 'pet_store'): Promise<GooglePlaceResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    const queryMap = {
      'veterinary_care': `veterinarian in ${city}`,
      'pet_grooming': `pet grooming in ${city}`,
      'pet_store': `pet store in ${city}`
    };

    const url = `${this.baseUrl}/textsearch/json`;
    const params = new URLSearchParams({
      query: queryMap[type],
      key: this.apiKey
    });

    try {
      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.results;
    } catch (error) {
      console.error(`Error searching for ${type} in ${city}:`, error);
      throw error;
    }
  }

  getPhotoUrl(photoReference: string, maxWidth = 400): string {
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }
}

// Convert Google Place to our ServiceProvider format
export function convertGooglePlaceToServiceProvider(place: GooglePlaceResult, userId: string) {
  const serviceType = determineServiceType(place.types);
  
  return {
    userId,
    businessName: place.name,
    serviceType,
    specialty: getSpecialty(place.types, serviceType),
    city: extractCityFromAddress(place.vicinity || place.formatted_address),
    address: place.formatted_address || place.vicinity,
    phone: place.formatted_phone_number || null,
    website: place.website || null,
    description: `Professional ${serviceType.toLowerCase()} services`,
    rating: place.rating ? place.rating.toString() : "0",
    reviewCount: place.user_ratings_total || null,
    googlePlaceId: place.place_id || null,
    googleRating: place.rating ? place.rating.toString() : null,
    googleReviewCount: place.user_ratings_total || null,
    latitude: place.geometry.location.lat.toString(),
    longitude: place.geometry.location.lng.toString(),
    priceLevel: place.price_level || null,
    isVerified: true, // Google Places data is considered verified
    licenseNumber: null,
    specialties: null,
    yearsExperience: null,
    state: null,
    zipCode: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function determineServiceType(types: string[]): string {
  if (types.includes('veterinary_care')) return 'Veterinarian';
  if (types.includes('pet_store')) return 'Pet Store';
  if (types.some(type => type.includes('grooming') || type.includes('pet_care'))) return 'Groomer';
  return 'Pet Care Professional';
}

function getSpecialty(types: string[], serviceType: string): string {
  if (serviceType === 'Veterinarian') {
    if (types.includes('emergency')) return 'Emergency Care';
    if (types.includes('hospital')) return 'Animal Hospital';
    return 'General Practice';
  }
  if (serviceType === 'Groomer') {
    return 'Full Service Grooming';
  }
  if (serviceType === 'Pet Store') {
    if (types.includes('aquarium')) return 'Aquarium & Fish';
    return 'General Pet Supplies';
  }
  return 'General Pet Care';
}

function extractCityFromAddress(address: string): string {
  // Simple city extraction from address
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[parts.length - 2].trim();
  }
  return parts[0].trim();
}