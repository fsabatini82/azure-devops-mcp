# 🔒 Security Guidelines for Azure DevOps MCP Server

## Personal Access Token (PAT) Security

### ⚠️ NEVER commit your PAT to version control

Your Azure DevOps Personal Access Token should NEVER be hardcoded in files or committed to Git.

### ✅ Secure PAT Usage

1. **Use Environment Variables**:
   ```powershell
   # PowerShell
   $env:AZDO_PAT = "your-actual-pat-token-here"

   # Or persistently:
   [System.Environment]::SetEnvironmentVariable('AZDO_PAT', 'your-actual-pat-token-here', [System.EnvironmentVariableTarget]::User)
   ```

   ```bash
   # Bash/Linux
   export AZDO_PAT="your-actual-pat-token-here"
   ```

2. **Use .env files** (already gitignored):
   ```bash
   # Copy the example
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Azure CLI Integration**:
   ```bash
   # Login with Azure CLI (recommended for development)
   az login
   # Then use --authentication azcli
   ```

### 🛡️ PAT Best Practices

- **Minimal Scopes**: Only grant necessary permissions
- **Expiration**: Set short expiration dates
- **Rotation**: Regularly rotate your tokens
- **Monitoring**: Monitor PAT usage in Azure DevOps

### 🔍 How to Create a Secure PAT

1. Go to https://dev.azure.com/{your-org}/_usersSettings/tokens
2. Click "New Token"
3. Set minimal required scopes:
   - **Code**: Read (for repository access)
   - **Build**: Read (for pipeline access)
   - **Work Items**: Read & write (for work item access)
   - **Test Management**: Read & write (for test plans)
4. Set reasonable expiration (30-90 days max)
5. Store securely and never commit to code

### 🚨 If You Accidentally Commit a Secret

1. **Immediately revoke** the token in Azure DevOps
2. **Remove from Git history**:
   ```bash
   # Remove from all commits (destructive!)
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/file' --prune-empty --tag-name-filter cat -- --all
   ```
3. **Generate a new token**
4. **Force push** (if working alone) or coordinate with team

### 🔐 Alternative Authentication Methods

1. **Azure CLI** (recommended for development):
   ```bash
   mcp-server-azuredevops myorg --authentication azcli
   ```

2. **Interactive OAuth** (default):
   ```bash
   mcp-server-azuredevops myorg --authentication interactive
   ```

3. **Environment Variables** (CI/CD):
   ```bash
   mcp-server-azuredevops myorg --authentication env
   ```
