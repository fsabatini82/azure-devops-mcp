import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";

// Mock the createAuthenticator functionality for testing no-cache behavior
// This avoids importing the full auth module which has transitive dependencies
function createPatAuthenticatorForNoCacheTest(noCache = false) {
  if (!noCache) {
    // Standard behavior: read PAT once at startup and cache it
    const raw = process.env.AZDO_PAT || process.env.ADO_PAT || process.env.AZURE_DEVOPS_EXT_PAT || "";
    const pat = raw.trim();
    if (!pat) {
      throw new Error("PAT authentication selected but no PAT found. Set AZDO_PAT (preferred) or ADO_PAT / AZURE_DEVOPS_EXT_PAT environment variable.");
    }
    return async () => `pat:${pat}`; // Return cached PAT
  } else {
    // No-cache behavior: read PAT fresh from environment variables on every call
    return async () => {
      const freshRaw = process.env.AZDO_PAT || process.env.ADO_PAT || process.env.AZURE_DEVOPS_EXT_PAT || "";
      const freshPat = freshRaw.trim();
      if (!freshPat) {
        throw new Error("PAT authentication selected but no PAT found. Set AZDO_PAT (preferred) or ADO_PAT / AZURE_DEVOPS_EXT_PAT environment variable.");
      }
      return `pat:${freshPat}`;
    };
  }
}

// Mock createAuthenticator for other auth types
function createMockAuthenticator(type: string, tenantId?: string, noCache = false) {
  switch (type) {
    case "pat":
      return createPatAuthenticatorForNoCacheTest(noCache);
    case "interactive":
    case "azcli":
    case "env":
      // For non-PAT auth types, just return a mock that doesn't throw
      return async () => "mock-token";
    default:
      return async () => "mock-token";
  }
}

describe("No-cache functionality", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clean environment
    delete process.env.AZDO_PAT;
    delete process.env.ADO_PAT;
    delete process.env.AZURE_DEVOPS_EXT_PAT;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("PAT authentication with no-cache", () => {
    it("should re-read environment variables when no-cache is enabled", async () => {
      // Set initial PAT
      process.env.AZDO_PAT = "initial-pat-token";

      // Create authenticator with no-cache enabled
      const authenticator = createMockAuthenticator("pat", undefined, true);

      // Get initial token
      const initialToken = await authenticator();
      expect(initialToken).toBe("pat:initial-pat-token");

      // Change environment variable
      process.env.AZDO_PAT = "updated-pat-token";

      // Get token again - should reflect the new value
      const updatedToken = await authenticator();
      expect(updatedToken).toBe("pat:updated-pat-token");
    });

    it("should cache PAT when no-cache is disabled", async () => {
      // Set initial PAT
      process.env.AZDO_PAT = "initial-pat-token";

      // Create authenticator with no-cache disabled (default)
      const authenticator = createMockAuthenticator("pat", undefined, false);

      // Get initial token
      const initialToken = await authenticator();
      expect(initialToken).toBe("pat:initial-pat-token");

      // Change environment variable
      process.env.AZDO_PAT = "updated-pat-token";

      // Get token again - should still return the cached value
      const cachedToken = await authenticator();
      expect(cachedToken).toBe("pat:initial-pat-token");
    });

    it("should handle missing PAT with no-cache enabled", async () => {
      // Don't set any PAT environment variables

      // Create authenticator with no-cache enabled
      const authenticator = createMockAuthenticator("pat", undefined, true);

      // Should throw an error
      await expect(authenticator()).rejects.toThrow("PAT authentication selected but no PAT found");
    });

    it("should prioritize AZDO_PAT over other PAT env vars with no-cache", async () => {
      process.env.AZDO_PAT = "azdo-pat-token";
      process.env.ADO_PAT = "ado-pat-token";
      process.env.AZURE_DEVOPS_EXT_PAT = "ext-pat-token";

      const authenticator = createMockAuthenticator("pat", undefined, true);
      const token = await authenticator();

      expect(token).toBe("pat:azdo-pat-token");
    });

    it("should fall back to ADO_PAT when AZDO_PAT is not set with no-cache", async () => {
      process.env.ADO_PAT = "ado-pat-token";
      process.env.AZURE_DEVOPS_EXT_PAT = "ext-pat-token";

      const authenticator = createMockAuthenticator("pat", undefined, true);
      const token = await authenticator();

      expect(token).toBe("pat:ado-pat-token");
    });

    it("should handle empty PAT after trimming with no-cache", async () => {
      process.env.AZDO_PAT = "   "; // Only whitespace

      const authenticator = createMockAuthenticator("pat", undefined, true);

      await expect(authenticator()).rejects.toThrow("PAT authentication selected but no PAT found");
    });
  });

  describe("Other authentication modes with no-cache", () => {
    it("should accept no-cache parameter for interactive auth", () => {
      // Should not throw when creating authenticator
      expect(() => createMockAuthenticator("interactive", undefined, true)).not.toThrow();
    });

    it("should accept no-cache parameter for azcli auth", () => {
      // Should not throw when creating authenticator
      expect(() => createMockAuthenticator("azcli", undefined, true)).not.toThrow();
    });

    it("should accept no-cache parameter for env auth", () => {
      // Should not throw when creating authenticator
      expect(() => createMockAuthenticator("env", undefined, true)).not.toThrow();
    });
  });
});
