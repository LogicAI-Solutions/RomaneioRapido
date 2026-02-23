param(
    [int]$BackendPort = 8002,
    [int]$FrontendPort = 5174,
    [int]$MaxTries = 15,
    [int]$WaitSeconds = 2
)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Verificando Sistema RomaneioRapido" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

function Test-Endpoint {
    param([string]$Url, [string]$Name)
    
    $msgTest = 'Testando {0} em {1}...' -f $Name, $Url
    Write-Host "`n$msgTest" -ForegroundColor Yellow

    for ($i = 1; $i -le $MaxTries; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $msgOk = '[OK] {0} esta ONLINE e respondendo!' -f $Name
                Write-Host $msgOk -ForegroundColor Green
                return $true
            }
        } catch {
            $msgFail = '  Tentativa {0}/{1}: Falhou ({2})' -f $i, $MaxTries, $_.Exception.Message
            Write-Host $msgFail -ForegroundColor DarkGray
        }
        Start-Sleep -Seconds $WaitSeconds
    }
    
    $msgErr = '[ERRO] {0} nao respondeu apos varias tentativas.' -f $Name
    Write-Host $msgErr -ForegroundColor Red
    return $false
}

$apiUrl = 'http://localhost:{0}/health' -f $BackendPort
$apiOk = Test-Endpoint -Url $apiUrl -Name 'Backend API (Health Check)'

$frontUrl = 'http://localhost:{0}' -f $FrontendPort
$frontOk = Test-Endpoint -Url $frontUrl -Name 'Frontend (Painel Web)'

Write-Host "`n====================================" -ForegroundColor Cyan
if ($apiOk -and $frontOk) {
    Write-Host "TUDO PRONTO! O sistema subiu perfeitamente." -ForegroundColor Green
    
    $apiDocs = 'http://localhost:{0}/docs' -f $BackendPort
    
    $msgApi = 'Acesso API: {0}' -f $apiDocs
    $msgFront = 'Acesso Frontend: {0}' -f $frontUrl

    Write-Host $msgApi -ForegroundColor Yellow
    Write-Host $msgFront -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "FALHA: Um ou mais servicos estao com problema." -ForegroundColor Red
    Write-Host "Dica: Rode 'docker compose logs -f' para ver o problema detalhado." -ForegroundColor Yellow
    exit 1
}
