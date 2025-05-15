export interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  created_at: string;
  updated_at: string;
  vehicle_info?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  review?: {
    rating: number;
    comment: string;
  };
  clientName?: string;
  origin?: {
    address: string;
    lat: number;
    lng: number;
  };
  destination?: {
    address: string;
    lat: number;
    lng: number;
  };
  user: {
    name: string;
    email: string;
  };
  vehicle: {
    model: string;
    plate: string;
  };
}

export interface ServiceRequestStatus {
  id: string;
  status: ServiceRequest['status'];
  updated_at: string;
}

export interface ServiceRequestReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ServiceRequestFormData {
  service_type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  vehicle_info?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  origin?: {
    address: string;
    lat: number;
    lng: number;
  };
  destination?: {
    address: string;
    lat: number;
    lng: number;
  };
} 