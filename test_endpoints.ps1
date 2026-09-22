$endpoints = @(
    "http://localhost:5173/",
    "http://localhost:8761/",
    "http://localhost:8888/",
    "http://localhost:8080/"
)

foreach ($url in $endpoints) {
    try {
        $res = Invoke-WebRequest -Uri $url -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "SUCCESS: $url responded with HTTP $($res.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "STATUS: $url -> $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
