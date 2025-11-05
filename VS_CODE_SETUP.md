# 🚀 VS Code Setup for Azure DevOps MCP Server

## Quick Install

[![Install with NPX in VS Code](https://img.shields.io/badge/VS_Code-Install_AzureDevops_MCP_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=ado&config=%7B%20%22type%22%3A%20%22stdio%22%2C%20%22command%22%3A%20%22npx%22%2C%20%22args%22%3A%20%5B%22-y%22%2C%20%22@fsabatini82/azure-devops-mcp%22%2C%20%22%24%7Binput%3Aado_org%7D%22%5D%7D&inputs=%5B%7B%22id%22%3A%20%22ado_org%22%2C%20%22type%22%3A%20%22promptString%22%2C%20%22description%22%3A%20%22Azure%20DevOps%20organization%20name%20%20%28e.g.%20%27contoso%27%29%22%7D%5D)

## Manual Setup

### 1. Create MCP Configuration

Create `.vscode/mcp.json` in your project:

```json
{
  "inputs": [
    {
      "id": "ado_org",
      "type": "promptString",
      "description": "Azure DevOps organization name (e.g. 'contoso')"
    }
  ],
  "servers": {
    "ado": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@fsabatini82/azure-devops-mcp", "${input:ado_org}"]
    }
  }
}
```

### 2. With PAT Authentication

```json
{
  "inputs": [
    {
      "id": "ado_org",
      "type": "promptString",
      "description": "Azure DevOps organization name (e.g. 'contoso')"
    }
  ],
  "servers": {
    "ado_pat": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@fsabatini82/azure-devops-mcp", "${input:ado_org}", "--authentication", "pat"]
    }
  }
}
```

### 3. With Cache Control (v2.3.4+)

Use `--no-cache` when you need fresh authentication tokens:

```json
{
  "inputs": [
    {
      "id": "ado_org",
      "type": "promptString",
      "description": "Azure DevOps organization name (e.g. 'contoso')"
    }
  ],
  "servers": {
    "ado_pat": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@fsabatini82/azure-devops-mcp", "${input:ado_org}", "--authentication", "pat"]
    },
    "ado_pat_nocache": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@fsabatini82/azure-devops-mcp", "${input:ado_org}", "--authentication", "pat", "--no-cache"],
      "description": "Forces fresh authentication - use when changing PAT tokens"
    }
  }
}
```

**When to use `--no-cache`:**
- ✅ After updating your PAT token
- ✅ When switching organizations
- ✅ Authentication issues after environment changes
- ✅ Debugging token problems

### 4. Set Environment Variable

```powershell
# PowerShell
$env:AZDO_PAT = "your-azure-devops-pat-token"

# Or permanently
[Environment]::SetEnvironmentVariable('AZDO_PAT', 'your-pat-token', 'User')
```

### 5. Use in VS Code

1. Install [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
2. Open VS Code in your project
3. Start the MCP server
4. Switch to Agent Mode in Copilot Chat
5. Select the Azure DevOps tools
6. Try: "List ADO projects"

## 🔧 Troubleshooting

### Authentication Issues

If you're experiencing authentication problems after changing tokens:

1. **Use the no-cache configuration**: Switch to `ado_pat_nocache` server in your MCP settings
2. **Restart VS Code**: Close and reopen VS Code completely
3. **Verify environment variable**: Check that `$env:AZDO_PAT` contains your new token
4. **Check token permissions**: Ensure your PAT has the required scopes

### Common Issues

| Problem | Solution |
|---------|----------|
| "Token not found" | Set `AZDO_PAT` environment variable |
| "Cached old token" | Use `--no-cache` parameter |
| "Authentication failed" | Verify PAT is valid and has correct scopes |
| "Server not starting" | Check Node.js version (20+ required) |

## Authentication Options

| Mode | Flag | Description | Use `--no-cache` when |
|------|------|-------------|----------------------|
| OAuth (default) | `--authentication interactive` | Browser login | Switching accounts |
| Azure CLI | `--authentication azcli` | Use `az login` | After `az login` change |
| Environment | `--authentication env` | Managed identity | Environment changes |
| **PAT** | `--authentication pat` | Personal Access Token | **Changing PAT tokens** |

Get your PAT: https://dev.azure.com/{org}/_usersSettings/tokens

## 💡 Pro Tips

- **Development**: Use `--no-cache` temporarily when testing different tokens
- **Production**: Remove `--no-cache` once authentication is stable for better performance
- **Multiple Orgs**: Create separate server configurations for different organizations
- **Token Security**: Never commit PAT tokens to version control
