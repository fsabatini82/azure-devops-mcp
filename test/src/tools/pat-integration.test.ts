import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { getCurrentUserDetails } from "../../../src/tools/auth";
import type { WebApi } from "azure-devops-node-api";
import { buildAuthorizationHeader } from "../../../src/auth-headers";

// Minimal token provider simulating PAT mode returning sentinel value consumed by buildAuthorizationHeader
const makePatProvider = (pat: string) => async () => `pat:${pat}`;

describe("PAT integration header mapping", () => {
  const orgUrl = "https://dev.azure.com/test-org";
  const connectionProvider = async () => ({ serverUrl: orgUrl }) as unknown as WebApi;
  const userAgentProvider = () => "Jest";

  beforeEach(() => {
    const f = jest.fn(() => Promise.resolve({ ok: true, json: async () => ({}) }));
    // @ts-expect-error assign mock
    global.fetch = f;
  });

  it("sends Basic Authorization header derived from PAT", async () => {
    const pat = "ABC123PAT";
    const tokenProvider = makePatProvider(pat);
    const expectedAuth = buildAuthorizationHeader(`pat:${pat}`); // Basic ...

    // Replace implementation for this test case
    // Minimal mock fetch typing
    type MockFetch = ((...args: unknown[]) => Promise<unknown>) & { mockImplementation: (fn: () => Promise<{ ok: boolean; json: () => Promise<unknown> }>) => void };
    (global.fetch as unknown as MockFetch).mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ user: { id: "u1" } }) }));

    await getCurrentUserDetails(tokenProvider, connectionProvider, userAgentProvider);

    expect(global.fetch).toHaveBeenCalledWith(
      `${orgUrl}/_apis/connectionData`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Authorization": expectedAuth,
          "User-Agent": "Jest",
        }),
      })
    );
  });
});
