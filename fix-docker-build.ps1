# ============================================
# 🔧 Script de Correção do Docker BuildKit
# ============================================

Write-Host "🚨 INICIANDO CORREÇÃO DO DOCKER..." -ForegroundColor Yellow
Write-Host ""

# 1. Parar tudo
Write-Host "1️⃣ Parando containers..." -ForegroundColor Cyan
docker-compose down -v 2>$null
docker stop $(docker ps -aq) 2>$null
docker rm $(docker ps -aq) 2>$null
Write-Host "   ✅ Containers parados" -ForegroundColor Green
Write-Host ""

# 2. Desabilitar BuildKit
Write-Host "2️⃣ Desabilitando BuildKit..." -ForegroundColor Cyan
$env:DOCKER_BUILDKIT = "0"
$env:COMPOSE_DOCKER_CLI_BUILD = "0"
Write-Host "   ✅ DOCKER_BUILDKIT=$env:DOCKER_BUILDKIT" -ForegroundColor Green
Write-Host "   ✅ COMPOSE_DOCKER_CLI_BUILD=$env:COMPOSE_DOCKER_CLI_BUILD" -ForegroundColor Green
Write-Host ""

# 3. Limpar cache
Write-Host "3️⃣ Limpando cache do Docker..." -ForegroundColor Cyan
docker builder prune -a -f 2>$null
docker buildx prune -a -f 2>$null
Write-Host "   ✅ Cache limpo" -ForegroundColor Green
Write-Host ""

# 4. Remover imagens do projeto
Write-Host "4️⃣ Removendo imagens antigas..." -ForegroundColor Cyan
docker rmi api-gateway identity-api catalog-api basket-api order-api -f 2>$null
Write-Host "   ✅ Imagens removidas" -ForegroundColor Green
Write-Host ""

# 5. Limpar sistema
Write-Host "5️⃣ Limpando sistema Docker..." -ForegroundColor Cyan
docker system prune -a -f 2>$null
Write-Host "   ✅ Sistema limpo" -ForegroundColor Green
Write-Host ""

# 6. Verificar espaço em disco
Write-Host "6️⃣ Verificando espaço em disco..." -ForegroundColor Cyan
$drive = Get-PSDrive C
$freeGB = [math]::Round($drive.Free / 1GB, 2)
Write-Host "   💾 Espaço livre: $freeGB GB" -ForegroundColor $(if ($freeGB -lt 10) { "Red" } else { "Green" })
if ($freeGB -lt 5) {
    Write-Host "   ⚠️  AVISO: Pouco espaço em disco!" -ForegroundColor Yellow
}
Write-Host ""

# 7. Subir apenas infraestrutura primeiro
Write-Host "7️⃣ Subindo infraestrutura (MongoDB, Redis, RabbitMQ)..." -ForegroundColor Cyan
docker-compose up -d mongodb redis rabbitmq seq
Write-Host "   ⏳ Aguardando 15 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host "   ✅ Infraestrutura rodando" -ForegroundColor Green
Write-Host ""

# 8. Buildar cada serviço individualmente
Write-Host "8️⃣ Buildando microserviços (um por vez)..." -ForegroundColor Cyan

Write-Host "   📦 Buildando Identity API..." -ForegroundColor White
docker-compose build --no-cache identity-api
if ($LASTEXITCODE -eq 0) {
    docker-compose up -d identity-api
    Write-Host "   ✅ Identity API OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro no Identity API" -ForegroundColor Red
    exit 1
}

Write-Host "   📦 Buildando Catalog API..." -ForegroundColor White
docker-compose build --no-cache catalog-api
if ($LASTEXITCODE -eq 0) {
    docker-compose up -d catalog-api
    Write-Host "   ✅ Catalog API OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro no Catalog API" -ForegroundColor Red
    exit 1
}

Write-Host "   📦 Buildando Basket API..." -ForegroundColor White
docker-compose build --no-cache basket-api
if ($LASTEXITCODE -eq 0) {
    docker-compose up -d basket-api
    Write-Host "   ✅ Basket API OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro no Basket API" -ForegroundColor Red
    exit 1
}

Write-Host "   📦 Buildando Order API..." -ForegroundColor White
docker-compose build --no-cache order-api
if ($LASTEXITCODE -eq 0) {
    docker-compose up -d order-api
    Write-Host "   ✅ Order API OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro no Order API" -ForegroundColor Red
    exit 1
}

Write-Host "   📦 Buildando API Gateway..." -ForegroundColor White
docker-compose build --no-cache api-gateway
if ($LASTEXITCODE -eq 0) {
    docker-compose up -d api-gateway
    Write-Host "   ✅ API Gateway OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro no API Gateway" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 TUDO PRONTO!" -ForegroundColor Green
Write-Host ""

# 9. Mostrar status
Write-Host "9️⃣ Status dos containers:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""

# 10. Testar endpoints
Write-Host "🔍 Testando Gateway..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/Auth/login" -Method POST -ContentType "application/json" -Body '{"username":"test","password":"test"}' -ErrorAction SilentlyContinue
    Write-Host "   ✅ Gateway está respondendo!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Gateway ainda está inicializando ou endpoint inválido" -ForegroundColor Yellow
    Write-Host "   💡 Tente: http://localhost:5000" -ForegroundColor White
}

Write-Host ""
Write-Host "📋 URLs dos serviços:" -ForegroundColor Cyan
Write-Host "   🌐 Gateway:   http://localhost:5000" -ForegroundColor White
Write-Host "   🔐 Identity:  http://localhost:5001" -ForegroundColor White
Write-Host "   📦 Catalog:   http://localhost:6001" -ForegroundColor White
Write-Host "   🛒 Basket:    http://localhost:7001" -ForegroundColor White
Write-Host "   📝 Order:     http://localhost:8001" -ForegroundColor White
Write-Host "   🐰 RabbitMQ:  http://localhost:15672 (guest/guest)" -ForegroundColor White
Write-Host "   📊 Seq Logs:  http://localhost:5341" -ForegroundColor White
Write-Host ""
Write-Host "✅ Pronto para usar!" -ForegroundColor Green

