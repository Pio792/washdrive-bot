@echo off
setlocal enabledelayedexpansion
REM Avvio rapido server HTTP per WashDrive
REM Uso:
REM   start_server.cmd                 -> porta 8080 default
REM   start_server.cmd 8000            -> porta 8000
REM   start_server.cmd fw              -> porta default + crea regola firewall (richiede Admin)
REM   start_server.cmd 8000 fw         -> porta 8000 + regola firewall

set PORT=8080
set ADD_FW=

if not "%~1"=="" (
  echo %~1 | findstr /R "^[0-9][0-9]*$" >nul
  if !errorlevel! == 0 (
    set PORT=%~1
  ) else if /I "%~1"=="fw" (
    set ADD_FW=1
  ) else (
    echo [INFO] Argomento ignorato: %~1 (non numerico ne' 'fw')
  )
)
if /I "%~2"=="fw" set ADD_FW=1

REM Rileva primo IP privato valido (192.168.* / 10.* / 172.*)
set LANIP=
for /f "tokens=2 delims=:" %%I in ('ipconfig ^| findstr /R /C:"IPv4"') do (
  set raw=%%I
  for /f "tokens=* delims= " %%J in ("!raw!") do (
    set cand=%%J
    if not defined LANIP (
      if "!cand:~0,8!"=="192.168." set LANIP=!cand!
      if "!cand:~0,3!"=="10."       if not defined LANIP set LANIP=!cand!
      if "!cand:~0,4!"=="172."      if not defined LANIP set LANIP=!cand!
    )
  )
)
if not defined LANIP set LANIP=192.168.1.123

where python >nul 2>&1
if %ERRORLEVEL%==0 (
  set PY=python
) else (
  where py >nul 2>&1
  if %ERRORLEVEL%==0 (
    set PY=py
  ) else (
    echo [ERRORE] Python non trovato nel PATH. Installa da https://www.python.org/downloads/ e riprova.
    pause
    exit /b 1
  )
)

echo ===============================
echo  Avvio server WashDrive
echo  Porta:        %PORT%
echo  URL locale:   http://localhost:%PORT%
echo  Per telefono: http://%LANIP%:%PORT%
echo  Firewall fw?: %ADD_FW%
echo ===============================

if defined ADD_FW (
  echo [Firewall] Verifica privilegi amministrativi...
  net session >nul 2>&1
  if errorlevel 1 (
    echo [Firewall] Servono privilegi Admin per creare la regola. Riesegui "Come amministratore" se vuoi aprire la porta.
  ) else (
    netsh advfirewall firewall show rule name="WashDriveDev%PORT%" >nul 2>&1
    if errorlevel 1 (
      echo [Firewall] Creo regola inbound privata porta %PORT% ...
      netsh advfirewall firewall add rule name="WashDriveDev%PORT%" dir=in action=allow protocol=TCP localport=%PORT% profile=private >nul
      if errorlevel 1 (
        echo [Firewall] ERRORE creazione regola.
      ) else (
        echo [Firewall] Regola creata con successo.
      )
    ) else (
      echo [Firewall] Regola gia' presente.
    )
  )
)

echo [INFO] Avvio server (Ctrl+C per fermare)...
%PY% -m http.server %PORT% --bind 0.0.0.0

echo.
echo (Suggerimento) Se il telefono non apre: prova argomento fw, controlla stessa rete Wi-Fi, disattiva hotspot isolati, o cambia porta (es: 8000).
pause
