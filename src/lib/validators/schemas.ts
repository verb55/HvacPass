import { z } from "zod";

// GPS Coordinates
export const gpsCoordinatesSchema = z.object({
  latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90),
  longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180),
});

// User Role
export const userRoleSchema = z.enum(["admin", "installer"]);

// Work Order Status
export const workOrderStatusSchema = z.enum(["draft", "in_progress", "completed", "cancelled"]);

// Work Order Type
export const workOrderTypeSchema = z.enum(["install", "service", "warranty"]);

// Photo Type
export const photoTypeSchema = z.enum(["protection", "technical", "final", "cleaning"]);

// Required photo types for completion
export const REQUIRED_PHOTO_TYPES: z.infer<typeof photoTypeSchema>[] = [
  "protection",
  "technical",
  "final",
  "cleaning",
];

// Create Work Order Schema
export const createWorkOrderSchema = z.object({
  unit_id: z.string().uuid("Invalid unit ID"),
  type: workOrderTypeSchema,
  gps_start: gpsCoordinatesSchema.optional(),
});

// Update Work Order Schema
export const updateWorkOrderSchema = z.object({
  status: workOrderStatusSchema.optional(),
  end_time: z.string().datetime().optional(),
  gps_end: gpsCoordinatesSchema.optional(),
  notes: z.string().max(5000, "Notes too long").optional(),
});

// Complete Work Order Schema
export const completeWorkOrderSchema = z.object({
  notes: z.string().max(5000).optional(),
  customer_signature: z.string().optional(),
}).refine(
  (data) => data.notes !== undefined || data.customer_signature !== undefined,
  { message: "Either notes or signature must be provided" }
);

// Photo Upload Schema
export const photoUploadSchema = z.object({
  work_order_id: z.string().uuid("Invalid work order ID"),
  type: photoTypeSchema,
  gps_coords: gpsCoordinatesSchema.optional(),
}).extend({
  file: z
    .instanceof(File, { message: "File is required" })
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only JPEG, PNG, and WebP files are allowed"
    ),
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Sign Up Schema
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number").optional(),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
});

// Unit Schema
export const unitSchema = z.object({
  customer_id: z.string().uuid("Invalid customer ID"),
  qr_code_id: z.string().min(1, "QR code ID is required"),
  brand: z.string().min(1, "Brand is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  serial_number: z.string().max(100).optional(),
  install_date: z.string().datetime().optional(),
  warranty_until: z.string().datetime().optional(),
});

// Customer Schema
export const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(3).default("PL"),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

// Update Profile Schema
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional().or(z.literal("")),
  preferred_lang: z.enum(["pl", "en", "de", "ua"]).optional(),
  license_number: z.string().max(50).optional(),
});

// Type exports
export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>;
export type CompleteWorkOrderInput = z.infer<typeof completeWorkOrderSchema>;
export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type UnitInput = z.infer<typeof unitSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
