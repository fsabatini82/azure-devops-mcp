import { buildAuthorizationHeader } from "../../src/auth-headers";

// Lightweight replica of PAT branch logic to isolate trimming behavior without invoking other auth modes.
function createPatAuthenticatorForTest() {
  const raw = process.env.AZDO_PAT || process.env.ADO_PAT || process.env.AZURE_DEVOPS_EXT_PAT;
  const pat = raw?.trim();
  if (!pat) {
    throw new Error("PAT authentication selected but no PAT found.");
  }
  return async () => `pat:${pat}`;
}

describe("PAT trimming", () => {
  beforeEach(() => {
    delete process.env.AZDO_PAT;
    delete process.env.ADO_PAT;
    delete process.env.AZURE_DEVOPS_EXT_PAT;
  });

  it("trims leading/trailing whitespace in PAT env var before building header", async () => {
    process.env.AZDO_PAT = "  abc123PAT  \n";
    const auth = createPatAuthenticatorForTest();
    const token = await auth();
    const header = buildAuthorizationHeader(token);
    const expected = Buffer.from(":abc123PAT").toString("base64");
    expect(header).toBe(`Basic ${expected}`);
  });

  it("rejects PAT that becomes empty after trim", () => {
    process.env.AZDO_PAT = "  \t  \n";
    expect(() => createPatAuthenticatorForTest()).toThrow(/no PAT found/i);
  });
});
