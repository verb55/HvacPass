import { describe, it, expect } from "vitest";
import { sanitizeInput, generateId, debounce, truncate, capitalize } from "@/lib/utils/helpers";

describe("Helper Utils", () => {
  describe("sanitizeInput", () => {
    it("should remove dangerous characters", () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeInput(input);
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).not.toContain('"');
    });

    it("should trim whitespace", () => {
      const input = "  Hello World  ";
      expect(sanitizeInput(input)).toBe("Hello World");
    });

    it("should allow safe characters", () => {
      const input = "Hello World 123 !@#$";
      expect(sanitizeInput(input)).toBe("Hello World 123 !@#$");
    });
  });

  describe("generateId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it("should contain timestamp", () => {
      const id = generateId();
      expect(id).toContain("-");
    });
  });

  describe("truncate", () => {
    it("should truncate long strings", () => {
      const input = "This is a very long string that should be truncated";
      const result = truncate(input, 20);
      expect(result).toBe("This is a very long ...");
      expect(result.length).toBe(23); // 20 + "..."
    });

    it("should not truncate short strings", () => {
      const input = "Short";
      expect(truncate(input, 20)).toBe("Short");
    });

    it("should handle exact length", () => {
      const input = "Exactly20Characters!!";
      expect(truncate(input, 20)).toBe(input);
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("should handle single character", () => {
      expect(capitalize("a")).toBe("A");
    });
  });

  describe("debounce", () => {
    it("should delay function execution", async () => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callCount).toBe(0);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(callCount).toBe(1);
    });
  });
});
