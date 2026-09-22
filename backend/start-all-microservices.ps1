# Start All DLM Backend Microservices with explicit JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

$services = @(
    @{ Name = "Config Server"; Path = "config-server"; Port = 8888 },
    @{ Name = "Discovery Server"; Path = "discovery-server"; Port = 8761 },
    @{ Name = "API Gateway"; Path = "api-gateway"; Port = 8080 },
    @{ Name = "Identity Service"; Path = "identity-service"; Port = 8081 },
    @{ Name = "Catalog Service"; Path = "catalog-service"; Port = 8082 },
    @{ Name = "Progress Service"; Path = "progress-service"; Port = 8083 },
    @{ Name = "Assessment Service"; Path = "assessment-service"; Port = 8084 },
    @{ Name = "Certification Service"; Path = "certification-service"; Port = 8085 },
    @{ Name = "Assignment Service"; Path = "assignment-service"; Port = 8086 },
    @{ Name = "Notification Service"; Path = "notification-service"; Port = 8087 }
)

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  STARTING ALL DLM BACKEND MICROSERVICES" -ForegroundColor Cyan
Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

foreach ($svc in $services) {
    $svcPath = Join-Path $baseDir $svc.Path
    Write-Host "`n🚀 Launching $($svc.Name) on Port $($svc.Port)..." -ForegroundColor Yellow
    
    $cmdString = "set JAVA_HOME=C:\Program Files\Java\jdk-17&& set PATH=%JAVA_HOME%\bin;%PATH%&& cd /d `"$svcPath`"&& mvnw.cmd spring-boot:run"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$cmdString`"" -WindowStyle Normal
    
    if ($svc.Port -eq 8888) {
        Write-Host "⏳ Waiting 12 seconds for Config Server to initialize..." -ForegroundColor Gray
        Start-Sleep -Seconds 12
    } elseif ($svc.Port -eq 8761) {
        Write-Host "⏳ Waiting 12 seconds for Eureka Discovery to initialize..." -ForegroundColor Gray
        Start-Sleep -Seconds 12
    } else {
        Start-Sleep -Seconds 4
    }
}

Write-Host "`n=================================================" -ForegroundColor Green
Write-Host "  ALL MICROSERVICES HAVE BEEN LAUNCHED!" -ForegroundColor Green
Write-Host "  Eureka Registry: http://localhost:8761" -ForegroundColor Green
Write-Host "  API Gateway:     http://localhost:8080" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
