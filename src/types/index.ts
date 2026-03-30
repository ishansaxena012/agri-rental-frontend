export interface User {
  id: string;
  _id: string;       
  name: string;
  email: string;
  phone?: string;
  mobileNumber?: string;  
  avatar?: string;
  address?: string;       
  isProfileComplete: boolean;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  earnings?: number;
}

export interface Equipment {
  id: string;
  _id: string;
  title: string;        
  name?: string;        
  category?: string;
  type: string;        
  pricePerDay: number;  
  price?: number;      
  description: string;
  location: {
    type: string;
    coordinates: [number, number]; 
  };
  address?: string;
  images: string[];
  owner: string | { _id: string; name: string; mobileNumber?: string; address?: string };
  ownerId?: string;
  distance?: number;
  isActive: boolean;    
  isAvailable?: boolean;
  availableFrom: string;
  availableTo: string;
  rating?: number;
  reviewCount?: number;
}

export interface Booking {
  id: string;
  _id: string;      
  equipment: string | Equipment;
  renter: string | User;         
  owner: string | User;    
  startDate: string;
  endDate: string;
  totalPrice: number;                
  platformFee: number;
  paymentMethod: "ONLINE" | "COD";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  razorpayOrderId?: string;
  rzpOrder?: { id: string; amount: number; currency: string };
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type BookingStatus = Booking["status"];
export type PaymentMethod = "ONLINE" | "COD";

export const CATEGORIES = [
  "Tractor",
  "Harvester",
  "Plough",
  "Seeder",
  "Irrigation",
  "Sprayer",
  "Cultivator",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
