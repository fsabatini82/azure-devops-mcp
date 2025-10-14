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

### 3. Set Environment Variable

```powershell
# PowerShell
$env:AZDO_PAT = "your-azure-devops-pat-token"

# Or permanently
[Environment]::SetEnvironmentVariable('AZDO_PAT', 'your-pat-token', 'User')
```

### 4. Use in VS Code

1. Install [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
2. Open VS Code in your project
3. Start the MCP server
4. Switch to Agent Mode in Copilot Chat
5. Select the Azure DevOps tools
6. Try: "List ADO projects"

## Authentication Options

| Mode | Flag | Description |
|------|------|-------------|
| OAuth (default) | `--authentication interactive` | Browser login |
| Azure CLI | `--authentication azcli` | Use `az login` |
| Environment | `--authentication env` | Managed identity |
| **PAT** | `--authentication pat` | Personal Access Token |

Get your PAT: https://dev.azure.com/{org}/_usersSettings/tokens
