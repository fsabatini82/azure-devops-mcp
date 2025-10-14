// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//
// Lightweight helpers for constructing Authorization headers without pulling heavy Azure Identity dependencies.

/**
 * Builds the Authorization header value appropriate for the provided token.
 *
 * Accepts either:
 *  - a raw access token string
 *  - a string prefixed with "pat:" (sentinel for Personal Access Tokens)
 *  - an object shaped like { token: string } (e.g. Azure Identity's AccessToken)
 *  - undefined / invalid values (returns a harmless empty Bearer header so tests that
 *    intentionally trigger earlier validation paths don't explode on header construction)
 */
export function buildAuthorizationHeader(rawToken: unknown): string {
  let token: string | undefined;

  function isAccessTokenObject(v: unknown): v is { token: string } {
    return !!v && typeof v === "object" && "token" in v && typeof (v as { token: unknown }).token === "string";
  }

  if (typeof rawToken === "string") {
    token = rawToken;
  } else if (isAccessTokenObject(rawToken)) {
    token = rawToken.token;
  }

  if (!token) {
    // Fallback – return an empty bearer header; callers that truly need a token will fail later
    return "Bearer ";
  }

  if (token.startsWith("pat:")) {
    const pat = token.slice(4);
    const encoded = Buffer.from(`:${pat}`).toString("base64");
    return `Basic ${encoded}`;
  }
  return `Bearer ${token}`;
}
