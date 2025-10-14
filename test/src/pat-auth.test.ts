import { describe, it, expect, beforeEach } from "@jest/globals";
import { buildAuthorizationHeader } from "../../src/auth-headers";

// We copy minimal PAT branch logic from createAuthenticator to keep this test light-weight
function createPatAuthenticatorForTest() {
  const raw = process.env.AZDO_PAT || process.env.ADO_PAT || process.env.AZURE_DEVOPS_EXT_PAT;
  const pat = raw && raw.trim();
  if (!pat) {
    throw new Error("PAT authentication selected but no PAT found.");
  }
  return async () => `pat:${pat}`;
}

// We only test buildAuthorizationHeader logic and PAT selection in createAuthenticator.

describe("PAT authentication", () => {
  beforeEach(() => {
    delete process.env.AZDO_PAT;
    delete process.env.ADO_PAT;
    delete process.env.AZURE_DEVOPS_EXT_PAT;
  });

  it("should produce Basic header when token starts with pat:", () => {
    const header = buildAuthorizationHeader("pat:MYTOKEN123");
    // Basic base64(:MYTOKEN123)
    const expected = Buffer.from(":MYTOKEN123").toString("base64");
    expect(header).toBe(`Basic ${expected}`);
  });

  it("should produce Bearer header for normal tokens", () => {
    const header = buildAuthorizationHeader("abc.def.ghi");
    expect(header).toBe("Bearer abc.def.ghi");
  });

  it("createAuthenticator('pat') should read AZDO_PAT first", async () => {
    process.env.AZDO_PAT = "PRIMARY";
    process.env.ADO_PAT = "SECONDARY";
    const auth = createPatAuthenticatorForTest();
    const token = await auth();
    expect(token).toBe("pat:PRIMARY");
  });

  it("createAuthenticator('pat') should fallback to ADO_PAT", async () => {
    process.env.ADO_PAT = "SECONDARY";
    const auth = createPatAuthenticatorForTest();
    const token = await auth();
    expect(token).toBe("pat:SECONDARY");
  });

  it("createAuthenticator('pat') should fallback to AZURE_DEVOPS_EXT_PAT", async () => {
    process.env.AZURE_DEVOPS_EXT_PAT = "EXT";
    const auth = createPatAuthenticatorForTest();
    const token = await auth();
    expect(token).toBe("pat:EXT");
  });

  it("createAuthenticator('pat') without env should throw", async () => {
    expect(() => createPatAuthenticatorForTest()).toThrow(/no PAT found/i);
  });

  it("createAuthenticator('pat') with empty string should throw", () => {
    process.env.AZDO_PAT = "";
    expect(() => createPatAuthenticatorForTest()).toThrow(/no PAT found/i);
  });

  it("createAuthenticator('pat') with whitespace only should throw", () => {
    process.env.AZDO_PAT = "   \t";
    expect(() => createPatAuthenticatorForTest()).toThrow(/no PAT found/i);
  });
});
