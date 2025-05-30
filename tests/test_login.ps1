$headers = @{ 'Content-Type' = 'application/json' }
$body = @{
    email = 'admin@sp.com'
    password = 'admin@123'
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/v1/auth/login' -Method POST -Headers $headers -Body $body
    Write-Host "✅ Login successful!"
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Login failed!"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
