@echo off
echo === WashDrive Mobile-Friendly Server ===

REM Verifica se Python è disponibile
python --version >nul 2>&1
if errorlevel 1 (
    echo Errore: Python non trovato nel PATH
    echo Installa Python da python.org
    pause
    exit /b 1
)

REM Verifica index.html
if not exist "index.html" (
    echo Errore: index.html non trovato
    echo Spostati nella cartella del sito
    pause
    exit /b 1
)

echo Avvio server Python sulla porta 8080...
start "WashDrive Server" cmd /k "python -m http.server 8080 --bind 0.0.0.0"

REM Attende che il server si avvii
timeout /t 3 /nobreak >nul

echo.
echo Avvio ngrok con configurazione mobile-friendly...

REM Configura ngrok per mobile (bypass warning)
ngrok http 8080 --log=stdout --log-level=info ^
  --host-header="localhost:8080" ^
  --request-header-add="ngrok-skip-browser-warning:true"

pause