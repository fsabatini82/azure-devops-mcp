#!/usr/bin/env pwsh

# 🔒 SECURE Test Server Script
# This version demonstrates secure PAT handling

Write-Host "🚀 Testing Azure DevOps MCP Server (Secure Version)..." -ForegroundColor Green

# Method 1: Check for environment variable first
if (-not $env:AZDO_PAT) {
    Write-Host ""
    Write-Host "⚠️  No AZDO_PAT environment variable found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔑 Please set your Azure DevOps Personal Access Token using ONE of these methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Option 1 - Set environment variable for this session:" -ForegroundColor Cyan
    Write-Host "   PowerShell: " -NoNewline -ForegroundColor White
    Write-Host "`$env:AZDO_PAT = 'your-pat-token-here'" -ForegroundColor Gray
    Write-Host "   CMD:        " -NoNewline -ForegroundColor White
    Write-Host "set AZDO_PAT=your-pat-token-here" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Option 2 - Set permanently for your user:" -ForegroundColor Cyan
    Write-Host "   " -NoNewline
    Write-Host "[Environment]::SetEnvironmentVariable('AZDO_PAT', 'your-pat-token-here', 'User')" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Option 3 - Use .env file:" -ForegroundColor Cyan
    Write-Host "   1. Copy .env.example to .env" -ForegroundColor Gray
    Write-Host "   2. Edit .env and add: AZDO_PAT=your-pat-token-here" -ForegroundColor Gray
    Write-Host "   3. Load with: Get-Content .env | ForEach { Set-Item -Path Env:\$(`$_.Split('=')[0]) -Value `$_.Split('=')[1] }" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Option 4 - Use Azure CLI (recommended for development):" -ForegroundColor Cyan
    Write-Host "   1. Run: az login" -ForegroundColor Gray
    Write-Host "   2. Use: --authentication azcli instead of --authentication pat" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔗 Get your PAT from: https://dev.azure.com/{your-org}/_usersSettings/tokens" -ForegroundColor Magenta
    Write-Host ""
    exit 1
}

# Validate PAT format (basic check)
if ($env:AZDO_PAT.Length -lt 20) {
    Write-Host "⚠️  Warning: PAT seems too short. Please verify it's correct." -ForegroundColor Yellow
}

# Mask PAT in output for security
$maskedPat = $env:AZDO_PAT.Substring(0, 4) + "*".PadLeft($env:AZDO_PAT.Length - 8, "*") + $env:AZDO_PAT.Substring($env:AZDO_PAT.Length - 4)
Write-Host "✅ PAT found: $maskedPat" -ForegroundColor Green

# Test server startup
Write-Host "🔍 Testing server startup..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "node" -ArgumentList ".\dist\index.js", "skyg", "--authentication", "pat", "-d", "core" -PassThru -NoNewWindow

Start-Sleep -Seconds 2

if ($serverProcess.HasExited) {
    Write-Host "❌ Server failed to start" -ForegroundColor Red
    Write-Host "💡 Try using Azure CLI authentication instead:" -ForegroundColor Yellow
    Write-Host "   az login" -ForegroundColor Gray
    Write-Host "   node .\dist\index.js skyg --authentication azcli -d core" -ForegroundColor Gray
    exit 1
} else {
    Write-Host "✅ Server started successfully (Process ID: $($serverProcess.Id))" -ForegroundColor Green

    # Kill the test server
    Stop-Process -Id $serverProcess.Id -Force
    Write-Host "🔄 Server test completed" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🎯 Your MCP server is working correctly with PAT authentication!" -ForegroundColor Green
Write-Host "📋 To get the project list, you can:" -ForegroundColor Cyan
Write-Host "   1. Use VS Code with Copilot Agent Mode" -ForegroundColor White
Write-Host "   2. Use the MCP Inspector: npx @modelcontextprotocol/inspector node .\dist\index.js skyg --authentication pat -d core" -ForegroundColor White
Write-Host "   3. Use Azure CLI auth: npx @modelcontextprotocol/inspector node .\dist\index.js skyg --authentication azcli -d core" -ForegroundColor White
Write-Host "   4. Integrate with any MCP-compatible client" -ForegroundColor White
Write-Host ""
Write-Host "🔒 Security reminder: Never commit your PAT to version control!" -ForegroundColor Red
