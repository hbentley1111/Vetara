// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PetDetails: {petId: string};
  AddPet: undefined;
  RecordDetails: {recordId: string};
  AddRecord: {petId?: string};
  ProviderDetails: {providerId: string};
  QRScanner: undefined;
  Camera: {type: 'record' | 'profile'};
};

export type MainTabParamList = {
  Dashboard: undefined;
  Pets: undefined;
  Records: undefined;
  Providers: undefined;
  Insurance: undefined;
  Profile: undefined;
};

// API types matching backend schema
export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  userType: 'pet_owner' | 'veterinarian' | 'groomer' | 'trainer';
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: string;
  breed: string;
  age: number | null;
  weight: number | null;
  color: string | null;
  microchipId: string | null;
  profileImageUrl: string | null;
  medicalNotes: string | null;
  emergencyContact: string | null;
  insurancePolicyNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  title: string;
  description: string | null;
  recordType: 'vaccination' | 'checkup' | 'surgery' | 'medication' | 'lab_results' | 'other';
  recordDate: string;
  providerId: string | null;
  attachmentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceProvider {
  id: string;
  businessName: string;
  contactEmail: string | null;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  specialties: string[] | null;
  serviceType: 'veterinarian' | 'groomer' | 'trainer' | 'boarding' | 'emergency';
  rating: number | null;
  reviewCount: number | null;
  isVerified: boolean;
  subscriptionTier: 'basic' | 'premium' | 'enterprise' | null;
  profileImageUrl: string | null;
  description: string | null;
  operatingHours: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  petId: string;
  providerId: string;
  scheduledDate: string;
  appointmentType: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InsurancePolicy {
  id: string;
  userId: string;
  petId: string;
  policyNumber: string;
  provider: string;
  coverageType: string;
  premiumAmount: number;
  deductible: number;
  coverageLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// UI Component types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

export interface HeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface PetForm {
  name: string;
  species: string;
  breed: string;
  age?: number;
  weight?: number;
  color?: string;
  microchipId?: string;
  medicalNotes?: string;
  emergencyContact?: string;
  insurancePolicyNumber?: string;
}

export interface RecordForm {
  title: string;
  description?: string;
  recordType: MedicalRecord['recordType'];
  recordDate: string;
  providerId?: string;
  notes?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}