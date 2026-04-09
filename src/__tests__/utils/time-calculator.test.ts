import { describe, it, expect } from "vitest";
import { formatDuration, formatDurationHuman, calculateDuration } from "@/lib/utils/time";

describe("Time Calculator", () => {
  describe("formatDuration", () => {
    it("should format duration correctly", () => {
      const ms = 2 * 60 * 60 * 1000 + 15 * 60 * 1000; // 2h 15m
      expect(formatDuration(ms)).toBe("02:15:00");
    });

    it("should handle zero duration", () => {
      expect(formatDuration(0)).toBe("00:00:00");
    });

    it("should handle negative duration as zero", () => {
      expect(formatDuration(-1000)).toBe("00:00:00");
    });

    it("should handle seconds only", () => {
      expect(formatDuration(45000)).toBe("00:00:45");
    });

    it("should handle hours only", () => {
      expect(formatDuration(3600000)).toBe("01:00:00");
    });

    it("should handle complex duration", () => {
      const ms = 3 * 60 * 60 * 1000 + 45 * 60 * 1000 + 30 * 1000; // 3h 45m 30s
      expect(formatDuration(ms)).toBe("03:45:30");
    });
  });

  describe("formatDurationHuman", () => {
    it("should format with hours and minutes", () => {
      const ms = 2 * 60 * 60 * 1000 + 15 * 60 * 1000;
      expect(formatDurationHuman(ms)).toBe("2h 15m");
    });

    it("should format minutes only for short durations", () => {
      const ms = 45 * 60 * 1000;
      expect(formatDurationHuman(ms)).toBe("45m");
    });

    it("should handle zero", () => {
      expect(formatDurationHuman(0)).toBe("0m");
    });
  });

  describe("calculateDuration", () => {
    it("should calculate duration between two dates", () => {
      const start = new Date("2024-01-15T08:00:00Z");
      const end = new Date("2024-01-15T10:15:00Z");
      const result = calculateDuration(start, end);
      expect(result).toBe(2 * 60 * 60 * 1000 + 15 * 60 * 1000);
    });

    it("should handle string dates", () => {
      const start = "2024-01-15T08:00:00Z";
      const end = "2024-01-15T10:15:00Z";
      const result = calculateDuration(start, end);
      expect(result).toBe(2 * 60 * 60 * 1000 + 15 * 60 * 1000);
    });

    it("should default to now if end is null", () => {
      const start = new Date();
      const before = Date.now();
      const result = calculateDuration(start, null);
      const after = Date.now();
      expect(result).toBeGreaterThanOrEqual(before - start.getTime());
      expect(result).toBeLessThanOrEqual(after - start.getTime());
    });
  });
});
