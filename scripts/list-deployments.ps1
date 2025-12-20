$ErrorActionPreference = 'Stop'

# Azure OpenAI resource endpoint and API key
$base    = 'https://skyne-m9q617jz-swedencentral.cognitiveservices.azure.com'
$url     = "$base/openai/deployments?api-version=2025-04-01-preview"
$headers = @{ 'api-key' = '<your_api_key_here>' }

Write-Host "Listing Azure OpenAI deployments from $url ..."
$response = Invoke-RestMethod -Method Get -Uri $url -Headers $headers
$response | ConvertTo-Json -Depth 20
