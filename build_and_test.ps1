param(
    [string]$BackendContainer = "romaneio_rapido_backend"
)

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " Iniciando Processo de Build e Validacao (Testes)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Testar Rotas do Backend
Write-Host "`n[1/2] Verificando integridade das rotas no backend..." -ForegroundColor Yellow

# Executa o pytest rodando dentro do container Docker do backend onde httpx e dependências estão instaladas
docker exec -e PYTHONPATH=/app $BackendContainer python -m pytest backend/test_routes.py -v

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERRO] Os testes de rota falharam! Verifique os logs acima." -ForegroundColor Red
    Write-Host "Build abortado por questoes de integridade da API." -ForegroundColor Red
    exit 1
} else {
    Write-Host "[OK] Testes de rota e healthcheck aprovados!" -ForegroundColor Green
}

# 2. Buildar o Frontend (React/Vite)
Write-Host "`n[2/2] Gerando build de producao do Frontend (npm run build)..." -ForegroundColor Yellow

try {
    Set-Location .\frontend
    # npm install --silent
    npm run build
}
finally {
    Set-Location ..
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERRO] A compilacao (build) do frontend falhou." -ForegroundColor Red
    exit 1
} else {
    Write-Host "[OK] Frontend buildado com sucesso!" -ForegroundColor Green
}

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host " PROCESSO CONCLUIDO COM SUCESSO! " -ForegroundColor Green
Write-Host " Sistema validado pelo pytest e frontend buildado." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
