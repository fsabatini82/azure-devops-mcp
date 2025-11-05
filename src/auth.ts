// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AzureCliCredential, ChainedTokenCredential, DefaultAzureCredential, TokenCredential } from "@azure/identity";
import { AccountInfo, AuthenticationResult, PublicClientApplication } from "@azure/msal-node";
import open from "open";

const scopes = ["499b84ac-1321-427f-aa17-267ca6975798/.default"];

class OAuthAuthenticator {
  static clientId = "0d50963b-7bb9-4fe7-94c7-a99af00b5136";
  static defaultAuthority = "https://login.microsoftonline.com/common";

  private accountId: AccountInfo | null;
  private publicClientApp: PublicClientApplication;
  private noCache: boolean;

  constructor(tenantId?: string, noCache = false) {
    this.accountId = null;
    this.noCache = noCache;
    this.publicClientApp = new PublicClientApplication({
      auth: {
        clientId: OAuthAuthenticator.clientId,
        authority: tenantId ? `https://login.microsoftonline.com/${tenantId}` : OAuthAuthenticator.defaultAuthority,
      },
    });
  }

  public async getToken(): Promise<string> {
    let authResult: AuthenticationResult | null = null;

    // If cache is disabled, skip silent token acquisition
    if (!this.noCache && this.accountId) {
      try {
        authResult = await this.publicClientApp.acquireTokenSilent({
          scopes,
          account: this.accountId,
        });
      } catch (error) {
        console.error("Silent authentication failed:", error);
        authResult = null;
      }
    }

    if (!authResult) {
      // Clear any cached accounts if no-cache is enabled
      if (this.noCache) {
        const accounts = await this.publicClientApp.getAllAccounts();
        for (const account of accounts) {
          await this.publicClientApp.getTokenCache().removeAccount(account);
        }
        this.accountId = null;
      }

      authResult = await this.publicClientApp.acquireTokenInteractive({
        scopes,
        openBrowser: async (url) => {
          open(url);
        },
        // Force fresh login if no-cache is enabled
        prompt: this.noCache ? "login" : undefined,
      });
      this.accountId = authResult.account;
    }

    if (!authResult.accessToken) {
      throw new Error("Failed to obtain Azure DevOps OAuth token.");
    }
    return authResult.accessToken;
  }
}

function createAuthenticator(type: string, tenantId?: string, noCache = false): () => Promise<string> {
  switch (type) {
    case "azcli":
    case "env": {
      if (type !== "env") {
        process.env.AZURE_TOKEN_CREDENTIALS = "dev";
      }
      let credential: TokenCredential = new DefaultAzureCredential(); // CodeQL [SM05138] resolved by explicitly setting AZURE_TOKEN_CREDENTIALS
      if (tenantId) {
        // Use Azure CLI credential if tenantId is provided for multi-tenant scenarios
        const azureCliCredential = new AzureCliCredential({ tenantId });
        credential = new ChainedTokenCredential(azureCliCredential, credential);
      }
      return async () => {
        // For azcli/env, we rely on the underlying credential providers to handle caching
        // The noCache parameter has limited effect here as the Azure SDK manages its own cache
        if (noCache && process.env.DEBUG) {
          console.debug("DEBUG: no-cache requested for azcli/env auth (limited effect - Azure SDK manages cache)");
        }
        const result = await credential.getToken(scopes);
        if (!result) {
          throw new Error("Failed to obtain Azure DevOps token. Ensure you have Azure CLI logged or use interactive type of authentication.");
        }
        return result.token;
      };
    }
    case "pat": {
      // When noCache is false, we read the PAT once and cache it
      // When noCache is true, we read the PAT fresh every time
      if (!noCache) {
        // Standard behavior: read PAT once at startup and cache it
        const raw = process.env.AZDO_PAT || process.env.ADO_PAT || process.env.AZURE_DEVOPS_EXT_PAT || "";
        const pat = raw.trim();
        if (!pat) {
          throw new Error("PAT authentication selected but no PAT found. Set AZDO_PAT (preferred) or ADO_PAT / AZURE_DEVOPS_EXT_PAT environment variable.");
        }
        if (process.env.DEBUG) {
          console.debug(`DEBUG: PAT authentication configured (length: ${pat.length}, cached: true)`);
        }
        return async () => `pat:${pat}`; // Return cached PAT
      } else {
        // No-cache behavior: read PAT fresh from environment variables on every call
        if (process.env.DEBUG) {
          console.debug("DEBUG: PAT authentication configured with no-cache (will re-read env vars on each call)");
        }
        return async () => {
          const freshRaw = process.env.AZDO_PAT || process.env.ADO_PAT || process.env.AZURE_DEVOPS_EXT_PAT || "";
          const freshPat = freshRaw.trim();
          if (!freshPat) {
            throw new Error("PAT authentication selected but no PAT found. Set AZDO_PAT (preferred) or ADO_PAT / AZURE_DEVOPS_EXT_PAT environment variable.");
          }
          if (process.env.DEBUG) {
            console.debug(`DEBUG: Fresh PAT read from environment (length: ${freshPat.length})`);
          }
          return `pat:${freshPat}`;
        };
      }
    }
    default: {
      // Interactive/OAuth authentication
      const authenticator = new OAuthAuthenticator(tenantId, noCache);
      return () => authenticator.getToken();
    }
  }
}
export { createAuthenticator };
