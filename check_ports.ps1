$ports = @(5173, 8888, 8761, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087)
$names = @{
    5173 = "Frontend Vite Portal"
    8888 = "Config Server"
    8761 = "Eureka Discovery Server"
    8080 = "API Gateway"
    8081 = "Identity Service"
    8082 = "Catalog Service"
    8083 = "Progress Service"
    8084 = "Assessment Service"
    8085 = "Certification Service"
    8086 = "Assignment Service"
    8087 = "Notification Service"
}

foreach ($p in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "[UP] Port $p : $($names[$p])" -ForegroundColor Green
    } else {
        Write-Host "[DOWN] Port $p : $($names[$p])" -ForegroundColor Red
    }
}
