# WashDrive Mobile Server Helper
Param(
  [int]$Port = 8080,
  [switch]$SkipNgrok
)

Write-Host "=== WashDrive Mobile Server Helper ===" -ForegroundColor Cyan

# Verifica Python
try {
  $pythonVersion = python --version 2>&1
  Write-Host "✓ Python trovato: $pythonVersion" -ForegroundColor Green
} catch {
  Write-Error "Python non trovato. Installa Python da python.org"
  return
}

# Verifica ngrok (solo se non skippiamo)
if (-not $SkipNgrok) {
  try {
    $ngrokVersion = ngrok version 2>&1
    Write-Host "✓ ngrok trovato: $($ngrokVersion.Split()[2])" -ForegroundColor Green
  } catch {
    Write-Warning "ngrok non trovato. Scarica da ngrok.com per accesso esterno"
    $SkipNgrok = $true
  }
}

# Verifica index.html
if (-not (Test-Path "index.html")) {
  Write-Error "index.html non trovato nella cartella corrente"
  return
}

# Trova IP locali
$localIPs = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
  $_.InterfaceAlias -notlike "*Loopback*" -and 
  $_.IPAddress -ne "127.0.0.1" -and
  $_.PrefixOrigin -eq "Dhcp" 
} | Select-Object -ExpandProperty IPAddress

Write-Host "`n📱 Accesso Mobile locale:" -ForegroundColor Yellow
# NOTA: uso formattazione -f per evitare errore di parsing su $_: all'interno delle doppie virgolette
$localIPs | ForEach-Object {
  Write-Host ("  http://{0}:{1}" -f $_, $Port) -ForegroundColor Cyan
}

# Test porta disponibile
$portInUse = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if ($portInUse) {
  Write-Warning "Porta $Port occupata. Uso porta $($Port + 1)"
  $Port = $Port + 1
}

Write-Host "`n🚀 Avvio server sulla porta $Port..." -ForegroundColor Green

# Avvia server Python in background
$serverJob = Start-Job -ScriptBlock {
  param($Port)
  python -m http.server $Port --bind 0.0.0.0
} -ArgumentList $Port

Start-Sleep 2

# Avvia ngrok se disponibile
if (-not $SkipNgrok) {
  Write-Host "🌐 Avvio tunnel ngrok..." -ForegroundColor Green
  
  # Crea configurazione ngrok temporanea per mobile
  $ngrokConfig = @"
version: "2"
tunnels:
  washdrive:
    proto: http
    addr: $Port
    host_header: localhost:$Port
    inspect: false
    bind_tls: true
"@
  
  $configPath = Join-Path $env:TEMP "washdrive-ngrok.yml"
  $ngrokConfig | Out-File -FilePath $configPath -Encoding UTF8
  
  try {
    # Avvia ngrok con configurazione mobile-friendly
    $ngrokJob = Start-Job -ScriptBlock {
      param($ConfigPath)
      ngrok start washdrive --config=$ConfigPath
    } -ArgumentList $configPath
    
    Start-Sleep 3
    
    # Ottieni URL pubblico
    try {
      $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction SilentlyContinue
      if ($tunnels -and $tunnels.tunnels) {
        $publicUrl = $tunnels.tunnels[0].public_url
        Write-Host "`n🔗 URL pubblico per mobile:" -ForegroundColor Yellow
        Write-Host "  $publicUrl" -ForegroundColor Green
        Write-Host "`n💡 Copia questo URL nel browser del telefono" -ForegroundColor Cyan
        
        # Copia URL negli appunti se possibile
        try {
          $publicUrl | Set-Clipboard
          Write-Host "  ✓ URL copiato negli appunti" -ForegroundColor Green
        } catch {
          # Ignore clipboard errors
        }
      }
    } catch {
      Write-Warning "Errore nel recuperare l'URL pubblico di ngrok"
    }
  } catch {
    Write-Warning "Errore nell'avvio di ngrok: $_"
  }
}

Write-Host "`n📋 Istruzioni per accesso mobile:" -ForegroundColor Yellow
Write-Host "1. Assicurati che il telefono sia sulla stessa rete Wi-Fi" -ForegroundColor White
Write-Host "2. Usa uno degli URL locali sopra nel browser del telefono" -ForegroundColor White
if (-not $SkipNgrok) {
  Write-Host "3. OPPURE usa l'URL pubblico ngrok (funziona ovunque)" -ForegroundColor White
}

Write-Host "`n⚠️  Se l'URL ngrok mostra un warning:" -ForegroundColor Red
Write-Host "   - Clicca 'Visit Site' per continuare" -ForegroundColor White
Write-Host "   - Oppure usa gli URL locali se sei sulla stessa rete" -ForegroundColor White

Write-Host "`nPremi CTRL+C per fermare il server" -ForegroundColor DarkGray

try {
  # Mantieni lo script attivo
  while ($true) {
    Start-Sleep 1
    # Controlla se il server è ancora attivo
    if ((Get-Job -Id $serverJob.Id).State -ne "Running") {
      Write-Warning "Server terminato inaspettatamente"
      break
    }
  }
} finally {
  # Cleanup
  Write-Host "`n🛑 Arresto server..." -ForegroundColor Red
  Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
  Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
  
  if ($ngrokJob) {
    Stop-Job -Job $ngrokJob -ErrorAction SilentlyContinue  
    Remove-Job -Job $ngrokJob -ErrorAction SilentlyContinue
  }
  
  # Rimuovi file config temporaneo
  if ($configPath -and (Test-Path $configPath)) {
    Remove-Item $configPath -ErrorAction SilentlyContinue
  }
  
  Write-Host "✓ Cleanup completato" -ForegroundColor Green
}