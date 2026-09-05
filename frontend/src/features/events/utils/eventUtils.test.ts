import { formatEventDate, isEventPast, statusVariant } from "./eventUtils";

describe("eventUtils", () => {
  describe("formatEventDate", () => {
    it("should return 'Date unavailable' if no date provided", () => {
      expect(formatEventDate("")).toBe("Date unavailable");
    });

    it("should correctly format an ISO string to a readable format", () => {
      const isoString = "2026-05-15T10:30:00Z";
      // The exact output might vary slightly based on environment execution time zones,
      // but it shouldn't crash and should contain the year/time parts.
      const formatted = formatEventDate(isoString);
      expect(formatted).toContain("15 May");
      expect(formatted).toContain("2026");
    });
  });

  describe("isEventPast", () => {
    it("should return false if no date is provided", () => {
      expect(isEventPast("")).toBe(false);
    });

    it("should return true for a date in the past", () => {
      expect(isEventPast("2020-01-01T10:00:00Z")).toBe(true);
    });

    it("should return false for a date in the future", () => {
      expect(isEventPast("2050-01-01T10:00:00Z")).toBe(false);
    });
  });

  describe("statusVariant", () => {
    it("should return default for OPEN", () => {
      expect(statusVariant("OPEN")).toBe("default");
    });

    it("should return destructive for CLOSED", () => {
      expect(statusVariant("CLOSED")).toBe("destructive");
    });

    it("should return secondary for anything else (e.g., CANCELLED)", () => {
      // @ts-expect-error Testing fallback behavior
      expect(statusVariant("CANCELLED")).toBe("secondary");
    });
  });
});
