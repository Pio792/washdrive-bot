Param(
  [int]$Port = 8080
)

Write-Host "=== WashDrive Local Server Helper ===" -ForegroundColor Cyan

# 1. Verifica presenza index.html
if(-not (Test-Path -LiteralPath "index.html")) {
  Write-Warning "index.html non trovato nella cartella corrente ($(Get-Location)). Spostati nella root del sito e riprova."
  return
}

# 2. Determina comando Python
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) { $pythonCmd = 'python' }
elseif (Get-Command py -ErrorAction SilentlyContinue) { $pythonCmd = 'py' }
else {
  Write-Error "Python non trovato. Installa da https://www.python.org/downloads/ e assicurati di aver spuntato 'Add to PATH'."
  return
}

Write-Host "Userà: $pythonCmd" -ForegroundColor Yellow

# 3. Mostra IP locali utili
Write-Host "Indirizzi IPv4 locali (escludo loopback e link-local):" -ForegroundColor Cyan
$ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.ValidLifetime -gt 0 } |
  Select-Object -ExpandProperty IPAddress -Unique
if(-not $ips){ Write-Warning "Nessun IP valido trovato (sei offline?)." } else {
  $ips | ForEach-Object { Write-Host "  -> http://$_:$Port" -ForegroundColor Green }
}

Write-Host "Se sei su Wi-Fi assicurati di non essere sulla rete 'guest' (isolata)." -ForegroundColor DarkCyan

# 4. Test porta libera
$inUse = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if($inUse){
  Write-Warning "La porta $Port è già in uso. Provo con $($Port+1)."
  $Port = $Port + 1
}

Write-Host "Avvio server su 0.0.0.0:$Port" -ForegroundColor Cyan

# 5. Avvio server
try {
  & $pythonCmd -m http.server $Port --bind 0.0.0.0
} catch {
  Write-Error "Errore avvio server: $_"
}

# Dopo CTRL+C
Write-Host "Server terminato." -ForegroundColor Magenta
