export type UserRole = "admin" | "installer";
export type WorkOrderStatus = "draft" | "in_progress" | "completed" | "cancelled";
export type WorkOrderType = "install" | "service" | "warranty";
export type PhotoType = "protection" | "technical" | "final" | "cleaning";

export interface Company {
  id: string;
  name: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  company_id: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  preferred_lang: string;
  license_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  address: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  customer_id: string;
  qr_code_id: string;
  brand: string;
  model: string;
  serial_number?: string;
  install_date?: string;
  install_params?: Record<string, unknown>;
  warranty_until?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UnitWithCustomer extends Unit {
  customer: Customer;
}

export interface WorkOrder {
  id: string;
  order_number: string;
  unit_id: string;
  installer_id: string;
  status: WorkOrderStatus;
  type: WorkOrderType;
  start_time?: string;
  end_time?: string;
  gps_start?: { longitude: number; latitude: number };
  gps_end?: { longitude: number; latitude: number };
  notes?: string;
  customer_signature?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderWithDetails extends WorkOrder {
  unit: UnitWithCustomer;
  installer: Profile;
  photos: Photo[];
}

export interface Photo {
  id: string;
  work_order_id: string;
  type: PhotoType;
  storage_path: string;
  file_size?: number;
  width?: number;
  height?: number;
  capture_timestamp: string;
  gps_coords?: { longitude: number; latitude: number };
  ai_analysis?: {
    quality_score?: number;
    issues_detected?: string[];
    detected_objects?: string[];
  };
  created_at: string;
}

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

// Form validation schemas
export interface CreateWorkOrderInput {
  unit_id: string;
  type: WorkOrderType;
  gps_start?: GPSCoordinates;
}

export interface UpdateWorkOrderInput {
  status?: WorkOrderStatus;
  end_time?: string;
  gps_end?: GPSCoordinates;
  notes?: string;
}

export interface UploadPhotoInput {
  work_order_id: string;
  type: PhotoType;
  file: File;
  gps_coords?: GPSCoordinates;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Dashboard stats
export interface DashboardStats {
  activeOrders: number;
  completedThisMonth: number;
  totalHoursWorked: number;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
}

export interface Session {
  user: AuthUser;
  profile: Profile;
}
