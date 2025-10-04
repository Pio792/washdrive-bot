@echo off
title WashDrive Bot Monitor
echo 🔄 Monitor WashDrive Bot - Riavvio automatico
echo ⚠️  Per fermare, chiudi questa finestra
:loop
echo 🤖 Avvio bot...
cd /d "C:\Users\Pio\OneDrive\Desktop\Sito washdrive"
"C:\Program Files\nodejs\node.exe" telegram-bot.js
echo 💥 Bot terminato, riavvio in 5 secondi...
timeout /t 5 /nobreak >nul
goto loop