import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, Pet, MedicalRecord, ServiceProvider, Appointment, InsurancePolicy} from '@/types';

// Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' // Development
  : 'https://your-production-domain.com/api'; // Production

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// API Client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && {Authorization: `Bearer ${token}`}),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{user: User; token: string}> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({email, password}),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {method: 'POST'});
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/auth/user');
  }

  // Pet endpoints
  async getPets(): Promise<Pet[]> {
    return this.request('/pets');
  }

  async getPet(id: string): Promise<Pet> {
    return this.request(`/pets/${id}`);
  }

  async createPet(petData: Partial<Pet>): Promise<Pet> {
    return this.request('/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  }

  async updatePet(id: string, petData: Partial<Pet>): Promise<Pet> {
    return this.request(`/pets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(petData),
    });
  }

  async deletePet(id: string): Promise<void> {
    return this.request(`/pets/${id}`, {method: 'DELETE'});
  }

  // Medical record endpoints
  async getMedicalRecords(petId?: string): Promise<MedicalRecord[]> {
    const endpoint = petId ? `/medical-records?petId=${petId}` : '/medical-records';
    return this.request(endpoint);
  }

  async getMedicalRecord(id: string): Promise<MedicalRecord> {
    return this.request(`/medical-records/${id}`);
  }

  async createMedicalRecord(recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    return this.request('/medical-records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  }

  async updateMedicalRecord(id: string, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    return this.request(`/medical-records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(recordData),
    });
  }

  async deleteMedicalRecord(id: string): Promise<void> {
    return this.request(`/medical-records/${id}`, {method: 'DELETE'});
  }

  // Service provider endpoints
  async getServiceProviders(): Promise<ServiceProvider[]> {
    return this.request('/service-providers');
  }

  async getTopRatedProviders(): Promise<ServiceProvider[]> {
    return this.request('/service-providers/top-rated');
  }

  async getServiceProvider(id: string): Promise<ServiceProvider> {
    return this.request(`/service-providers/${id}`);
  }

  async searchProviders(query: string, location?: string): Promise<ServiceProvider[]> {
    const params = new URLSearchParams({query});
    if (location) params.append('location', location);
    return this.request(`/service-providers/search?${params}`);
  }

  // Appointment endpoints
  async getAppointments(): Promise<Appointment[]> {
    return this.request('/appointments');
  }

  async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id: string, appointmentData: Partial<Appointment>): Promise<Appointment> {
    return this.request(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(appointmentData),
    });
  }

  async cancelAppointment(id: string): Promise<void> {
    return this.request(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({status: 'cancelled'}),
    });
  }

  // Insurance endpoints
  async getInsurancePolicies(): Promise<InsurancePolicy[]> {
    return this.request('/insurance/policies');
  }

  async getInsurancePartners(): Promise<any[]> {
    return this.request('/insurance/partners');
  }

  async calculateHealthScore(petId: string): Promise<{score: number; factors: any}> {
    return this.request(`/insurance/health-score/${petId}`, {method: 'POST'});
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<{
    totalPets: number;
    upcomingAppointments: number;
    recentRecords: number;
    healthAlerts: number;
  }> {
    return this.request('/dashboard/stats');
  }

  // File upload
  async uploadFile(file: any, type: 'medical-record' | 'pet-profile'): Promise<{url: string}> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const headers = await this.getAuthHeaders();
    delete headers['Content-Type']; // Let browser set content-type for FormData

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Helper functions for local storage
export const storage = {
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async setUserData(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  async getUserData(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  },
};