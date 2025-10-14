# Contributing to Azure DevOps MCP Server

[![npm version](https://img.shields.io/npm/v/@azure-devops/mcp?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/@azure-devops/mcp)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/microsoft/azure-devops-mcp)

Thank you for your interest in contributing to the Azure DevOps MCP Server! Your participation—whether through discussions, reporting issues, or suggesting improvements—helps us make the project better for everyone.

> 🚨 If you would like to contribute, please carefully follow the guidelines below. Pull requests that do not adhere to this process will be closed without review.

## 🏆 Expectations

As noted in the `README.md`, we aim to keep the tools in this MCP Server simple and focused on specific scenarios. If you wish to contribute or suggest new tools, please keep this in mind. We do not plan to introduce complex tools that require extensive logic. Our goal is to provide a straightforward abstraction layer over the REST API to accomplish targeted tasks.

## 🪲 Bugs and feature requests

Before submitting a new issue or suggestion, please search the existing issues to check if it has already been reported. If you find a matching issue, upvote (👍) it and consider adding a comment describing your specific scenario or requirements. This helps us prioritize based on community impact.

If your concern is not already tracked, feel free to [log a new issue](https://github.com/microsoft/azure-devops-mcp/issues). The code owners team will review your submission and may approve, request clarification, or reject it. Once approved, you can proceed with your contribution.

## 📝 Creating issues

When creating an issue:

- **DO** use a clear, descriptive title that identifies the problem or requested feature.
- **DO** provide a detailed description of the issue or feature request.
- **DO** include any relevant REST endpoints you wish to integrate with. Refer to the [public REST API documentation](https://learn.microsoft.com/en-us/rest/api/azure/devops).

For reference, see [this example of a well-formed issue](https://github.com/microsoft/azure-devops-mcp/issues/70).

## 👩‍💻 Writing code

We are accepting a limited number of pull requests during the public preview phase. If you notice something that should be changed or added, please create an issue first and provide details. Once reviewed, and if it makes sense to proceed, we will respond with a 👍.

Please include tests with your pull request. Pull requests will not be accepted until all relevant tests are updated and passing.

Code formatting is enforced by CI checks. Run `npm run format` to ensure your changes comply with the rules.

## 🖊️ Coding style

Follow the established patterns and styles in the repository. If you have suggestions for improvements, please open a new issue for discussion.

## 📑 Documentation

Update relevant documentation (e.g., README, existing code comments) to reflect new or altered functionality. Well-documented changes enable reviewers and future contributors to quickly understand the rationale and intended use of your code.

## 🤝 Code of conduct

You can find our code of conduct at the [Code of Conduct](./CODE_OF_CONDUCT.md) as a guideline for expected behavior in also at the contributions here. Please take a moment to review it before contributing.

## 🧭 Engineering Decisions & Rationale

This section captures notable implementation decisions so future contributors understand the current patterns and avoid re‑introducing past issues.

### PAT Authentication Handling

- We normalize Personal Access Tokens (PAT) by trimming surrounding whitespace before constructing the authorization header.
- An empty or whitespace‑only PAT is rejected early with a clear error message.
- The runtime sentinel format is `pat:<actualToken>` which signals header construction to emit a Basic auth header (`Basic base64(:<PAT>)`) per Azure DevOps PAT semantics (blank username).
- Tests avoid importing the full authenticator pipeline; instead they replicate the minimal PAT branch logic to keep tests fast and isolated from unrelated auth modes.

### Authorization Header Construction

- All tools build the `Authorization` header via a single helper (`buildAuthorizationHeader`) to ensure consistent behavior between Bearer tokens and PAT Basic headers.
- The helper accepts either a raw string or an AccessToken-shaped object (`{ token: string }`) to simplify integration with different credential sources.

### Test Strategy for PAT

- Two layers of tests:
  - `pat-auth.test.ts` exercises sentinel logic, precedence of env vars (`AZDO_PAT` > `ADO_PAT` > `AZURE_DEVOPS_EXT_PAT`), and error cases.
  - `pat-trim.test.ts` focuses specifically on whitespace trimming and empty-after-trim rejection.
- This separation keeps each test file focused and reduces duplication while remaining explicit about edge cases.

### ts-jest Hybrid Module Warnings

- The project uses `module: Node16` / `moduleResolution: Node16` ("hybrid" in ts-jest terminology). ts-jest recommends enabling `isolatedModules` for this mode, but doing so previously caused widespread test failures (ES module parsing issues under our current transform chain).
- Decision: Do **not** enable `isolatedModules` until a safe refactor plan is defined (e.g., migrating to native ESM across the repo or adjusting transforms). Stability > cosmetic warning removal.
- A lightweight warning filter (`test/jest.silence-warnings.ts`) suppresses repetitive ts-jest hybrid module warnings after Jest environment initialization while allowing other warnings through.
- We intentionally leave the initial early transformer warnings visible so investigators still see environment context if compilation issues arise.

### Jest Configuration Choices

- `maxWorkers` capped (currently 2) to reduce sporadic `EPERM` child process kill errors observed on Windows with Node 22.
- `globals['ts-jest'].diagnostics` configured with `warnOnly: true` and a narrow `ignoreCodes` list (example: 151001) to prevent benign diagnostics from turning CI runs noisy or flaky.
- Future migration path: adopt the newer recommended inline transform configuration (`transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { /* options */ }] }`) and remove deprecated `globals` usage in a dedicated PR.

### Debug Logging

- Production code uses `console.error()` only for genuine errors and failures.
- Debug logging is conditional on `DEBUG` environment variable to avoid noise in normal operation.
- PAT authentication includes optional debug logging (when `DEBUG=1`) to confirm configuration without exposing the token value.

### Guiding Principles

- Centralize logic that affects every tool (auth headers, validation) in shared helpers to ensure uniform behavior.
- Keep tests explicit about edge cases (whitespace, precedence, error conditions) to discourage accidental regressions.
- Prefer additive, low-risk mitigations (warning filtering, worker count tuning) over structural changes unless a clear benefit outweighs risk.

If you propose altering any of the above (e.g., enabling `isolatedModules`, changing sentinel token format, or restructuring auth), please open an issue first describing:

1. The motivation / problem.
2. Alternative options considered.
3. Migration / rollback strategy.

This helps maintain stability and shared understanding across contributors.
