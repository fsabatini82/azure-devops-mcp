# Frequently Asked Questions

Before you get started, ensure you follow the steps in the `README.md` file. This will help you get up and running and connected to your Azure DevOps organization.

## Does the MCP Server support both Azure DevOps Services and on-premises deployments?

Currently, the MCP Server supports only Azure DevOps Services. Several required API endpoints are not yet available for on-premises deployments. Additionally, focusing on Azure DevOps Services during the public preview makes it easier to debug and deliver fixes.

## Can I connect to more than one organization at a time?

No, you can connect to only one organization at a time. However, you can switch organizations as needed.

## Can I set a default project instead of fetching the list every time?

Currently, you need to fetch the list of projects so the LLM has context about the project name or ID. We plan to improve this experience in the future by leveraging prompts. In the meantime, you can set a default project name in your `copilot-instructions.md` file.

## Are PAT's supported?

**✅ Yes!** Personal Access Token (PAT) authentication is fully supported starting from version 2.3.0.

**Setup:**
1. Create a PAT in Azure DevOps (User Settings → Personal Access Tokens)
2. Set environment variable: `$env:AZDO_PAT = "your-pat-token"`
3. Use `--authentication pat` in your server configuration

**Example configuration:**
```json
{
  "servers": {
    "ado_pat": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@fsabatini82/azure-devops-mcp", "${input:ado_org}", "--authentication", "pat"]
    }
  }
}
```

## What if I change my PAT token and VS Code uses the old one?

Use the `--no-cache` parameter to force fresh authentication:

```json
{
  "servers": {
    "ado_pat_nocache": {
      "type": "stdio", 
      "command": "npx",
      "args": ["-y", "@fsabatini82/azure-devops-mcp", "${input:ado_org}", "--authentication", "pat", "--no-cache"]
    }
  }
}
```

This ensures VS Code doesn't use cached tokens when you update your environment variables.

## Is there a remote supported version of the MCP Server?

At this time, only the local version of the MCP Server is supported.
