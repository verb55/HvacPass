import { describe, it, expect } from "vitest";
import {
  createWorkOrderSchema,
  loginSchema,
  signUpSchema,
  photoUploadSchema,
  unitSchema,
  customerSchema,
} from "@/lib/validators/schemas";

describe("Form Validators", () => {
  describe("createWorkOrderSchema", () => {
    it("should validate valid work order", () => {
      const validData = {
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        type: "install",
      };
      const result = createWorkOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid unit_id", () => {
      const invalidData = {
        unit_id: "not-a-uuid",
        type: "install",
      };
      const result = createWorkOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid type", () => {
      const invalidData = {
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        type: "invalid",
      };
      const result = createWorkOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid GPS coordinates", () => {
      const validData = {
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        type: "install",
        gps_start: {
          latitude: 52.2297,
          longitude: 21.0122,
        },
      };
      const result = createWorkOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid GPS coordinates", () => {
      const invalidData = {
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        type: "install",
        gps_start: {
          latitude: 100, // Invalid: must be between -90 and 90
          longitude: 21.0122,
        },
      };
      const result = createWorkOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should validate valid login", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123",
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "not-an-email",
        password: "Password123",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "short",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("signUpSchema", () => {
    it("should validate valid signup", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123",
        full_name: "Jan Kowalski",
        company_name: "HVAC Services",
      };
      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject password without uppercase", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123",
        full_name: "Jan Kowalski",
        company_name: "HVAC Services",
      };
      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password without number", () => {
      const invalidData = {
        email: "test@example.com",
        password: "PasswordABC",
        full_name: "Jan Kowalski",
        company_name: "HVAC Services",
      };
      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short full name", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Password123",
        full_name: "J",
        company_name: "HVAC Services",
      };
      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("unitSchema", () => {
    it("should validate valid unit", () => {
      const validData = {
        customer_id: "550e8400-e29b-41d4-a716-446655440000",
        qr_code_id: "HVAC-123456",
        brand: "Daikin",
        model: "ATX35",
      };
      const result = unitSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty brand", () => {
      const invalidData = {
        customer_id: "550e8400-e29b-41d4-a716-446655440000",
        qr_code_id: "HVAC-123456",
        brand: "",
        model: "ATX35",
      };
      const result = unitSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("customerSchema", () => {
    it("should validate valid customer", () => {
      const validData = {
        name: "ACME Corporation",
        address: "123 Business Park, Warsaw",
      };
      const result = customerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should set default country to PL", () => {
      const validData = {
        name: "ACME Corporation",
        address: "123 Business Park, Warsaw",
      };
      const result = customerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country).toBe("PL");
      }
    });

    it("should validate optional phone format", () => {
      const validData = {
        name: "ACME Corporation",
        address: "123 Business Park",
        phone: "+48123456789",
      };
      const result = customerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid phone format", () => {
      const invalidData = {
        name: "ACME Corporation",
        address: "123 Business Park",
        phone: "invalid-phone",
      };
      const result = customerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
