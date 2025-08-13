export interface User {
  id: number;
  fullName: string;
  email: string;
  password?: string; // Optional on frontend for security reasons
  isVerified: boolean;
  createdAt: string; // Dates will be handled as strings in TypeScript
  updatedAt: string;
  phoneNumber?: string; // Optional as it doesn't have nullable=false
  username?: string;
  profilePictureUrl?: string;
  role: Role; // Enum value
  isActive: boolean;
  lastLoginAt?: string;
  memberPoints?: number; // Loyalty points earned from bookings
}

// Enum for user roles matching the backend
export enum Role {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
}
