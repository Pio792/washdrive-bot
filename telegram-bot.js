// WashDrive Telegram Bot - Sistema 100% Automatico
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configurazione
const BOT_TOKEN = process.env.BOT_TOKEN || '8050762607:AAGXo6iwN6uwfC1y0E3lR4Sv9bvAsG1jsiI';
// Su Render, usa /tmp che è scrivibile, altrimenti usa la directory corrente
const STATS_FILE = process.env.NODE_ENV === 'production' 
  ? '/tmp/stats.json' 
  : path.join(__dirname, 'stats.json');
// ID del proprietario (si imposta automaticamente al primo uso)
let OWNER_CHAT_ID = null;

// Funzione per fare richieste HTTP
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Leggi statistiche dal file
function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Errore lettura stats:', error);
  }
  
  // Default stats
  return {
    carsWashed: 0,
    nextSlot: '16:30',
    avgRating: 4.9,
    activeOperators: 1, // Cambiato da activeTechs a activeOperators
    lastUpdate: new Date().toISOString()
  };
}

// Salva statistiche nel file
function saveStats(stats) {
  try {
    stats.lastUpdate = new Date().toISOString();
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    console.log('📊 Statistiche salvate:', stats);
    return true;
  } catch (error) {
    console.error('Errore salvataggio stats:', error);
    return false;
  }
}

// Invia messaggio Telegram
async function sendMessage(chatId, text, options = {}) {
  try {
    const postData = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      ...options
    });
    
    const requestOptions = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
    
    await makeRequest(requestOptions, postData);
  } catch (error) {
    console.error('Errore invio messaggio:', error);
  }
}

// Genera prossimo slot disponibile
function getNextSlot() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Orari di lavoro: 8:00 - 20:00
  let nextHour = hours;
  let nextMinute = minutes < 30 ? 30 : 0;
  
  if (nextMinute === 0) nextHour++;
  
  // Se troppo tardi, primo slot domani
  if (nextHour >= 20) {
    nextHour = 8;
    nextMinute = 0;
  }
  
  // Se troppo presto, primo slot oggi
  if (nextHour < 8) {
    nextHour = 8;
    nextMinute = 0;
  }
  
  return `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
}

// Reset giornaliero automatico
function checkDailyReset() {
  const stats = loadStats();
  const today = new Date().toDateString();
  const lastUpdate = new Date(stats.lastUpdate).toDateString();
  
  if (lastUpdate !== today) {
    stats.carsWashed = 0;
    stats.nextSlot = getNextSlot();
    saveStats(stats);
    console.log('🔄 Reset giornaliero automatico effettuato');
    return true;
  }
  return false;
}

// Gestione comandi bot
async function handleCommand(chatId, username, command, args) {
  // Salva il primo utente come owner
  if (!OWNER_CHAT_ID) {
    OWNER_CHAT_ID = chatId;
    console.log(`👤 Owner impostato: ${username} (${chatId})`);
  }
  
  // Solo l'owner può usare il bot
  if (chatId !== OWNER_CHAT_ID) {
    await sendMessage(chatId, '❌ Non sei autorizzato ad usare questo bot.');
    return;
  }
  
  checkDailyReset();
  const stats = loadStats();
  
  switch (command) {
    case '/start':
      await sendMessage(chatId, `
🚗 <b>WashDrive Counter Bot</b>

<b>Comandi disponibili:</b>
/auto - Aggiungi un'auto lavata
/slot - Imposta prossimo slot
/operatori - Gestisci operatori attivi
/stats - Mostra statistiche
/reset - Reset contatore giornaliero
/help - Mostra tutti i comandi

Bot configurato per: <b>${username}</b>
Sistema: <b>100% Automatico</b> ✅
      `);
      break;
      
    case '/auto':
      stats.carsWashed++;
      stats.nextSlot = getNextSlot();
      saveStats(stats);
      
      await sendMessage(chatId, `
✅ <b>Auto lavata registrata!</b>

🚗 Auto lavate oggi: <b>${stats.carsWashed}</b>
⏰ Prossimo slot: <b>${stats.nextSlot}</b>
⭐ Rating: <b>${stats.avgRating}</b>
👥 Operatori attivi: <b>${stats.activeOperators || stats.activeTechs || 1}</b>

<i>🎯 Sito aggiornato automaticamente!</i>
      `);
      
      console.log(`🚗 Auto lavata! Totale oggi: ${stats.carsWashed}`);
      break;
      
    case '/slot':
      if (args.length === 0) {
        await sendMessage(chatId, `
⏰ <b>Gestione Slot</b>

Slot attuale: <b>${stats.nextSlot}</b>

<b>Comandi:</b>
/slot 16:30 - Imposta slot specifico
/slot +1 - Aggiungi 1 ora
/slot +30 - Aggiungi 30 minuti
/slot auto - Calcola automaticamente

<i>Esempio: /slot 14:30</i>
        `);
      } else {
        const timeArg = args[0];
        
        if (timeArg === 'auto') {
          stats.nextSlot = getNextSlot();
        } else if (timeArg.startsWith('+')) {
          const current = stats.nextSlot.split(':');
          let hours = parseInt(current[0]);
          let minutes = parseInt(current[1]);
          
          if (timeArg === '+1') {
            hours += 1;
          } else if (timeArg === '+30') {
            minutes += 30;
          } else {
            const addMinutes = parseInt(timeArg.slice(1));
            minutes += addMinutes;
          }
          
          if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            minutes = minutes % 60;
          }
          
          stats.nextSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } else if (timeArg.match(/^\d{1,2}:\d{2}$/)) {
          stats.nextSlot = timeArg;
        } else {
          await sendMessage(chatId, '❌ Formato non valido. Usa: HH:MM (es: 16:30)');
          break;
        }
        
        saveStats(stats);
        await sendMessage(chatId, `
✅ <b>Slot aggiornato!</b>

⏰ Nuovo slot: <b>${stats.nextSlot}</b>

<i>🎯 Sito aggiornato automaticamente!</i>
        `);
      }
      break;
      
    case '/operatori':
      if (args.length === 0) {
        await sendMessage(chatId, `
👥 <b>Gestione Operatori</b>

Operatori attivi: <b>${stats.activeOperators || stats.activeTechs || 1}</b>

<b>Comandi:</b>
/operatori 3 - Imposta 3 operatori
/operatori +1 - Aggiungi 1 operatore
/operatori -1 - Rimuovi 1 operatore

<i>Esempio: /operatori 2</i>
        `);
      } else {
        const operatorArg = args[0];
        let currentOps = stats.activeOperators || stats.activeTechs || 1;
        
        if (operatorArg.startsWith('+')) {
          currentOps += parseInt(operatorArg.slice(1)) || 1;
        } else if (operatorArg.startsWith('-')) {
          currentOps -= parseInt(operatorArg.slice(1)) || 1;
        } else {
          currentOps = parseInt(operatorArg) || 1;
        }
        
        currentOps = Math.max(1, Math.min(5, currentOps)); // Tra 1 e 5
        stats.activeOperators = currentOps;
        
        // Rimuovi il vecchio campo se esiste
        if (stats.activeTechs) {
          delete stats.activeTechs;
        }
        
        saveStats(stats);
        await sendMessage(chatId, `
✅ <b>Operatori aggiornati!</b>

👥 Operatori attivi: <b>${stats.activeOperators}</b>

<i>🎯 Sito aggiornato automaticamente!</i>
        `);
      }
      break;
      
    case '/stats':
      await sendMessage(chatId, `
📊 <b>Statistiche WashDrive</b>

🚗 Auto lavate oggi: <b>${stats.carsWashed}</b>
⏰ Prossimo slot: <b>${stats.nextSlot}</b>
⭐ Rating medio: <b>${stats.avgRating}</b>
👥 Operatori attivi: <b>${stats.activeOperators || stats.activeTechs || 1}</b>

🕐 Ultimo aggiornamento: <b>${new Date(stats.lastUpdate).toLocaleTimeString('it-IT')}</b>
✅ Sistema automatico attivo
      `);
      break;
      
    case '/reset':
      stats.carsWashed = 0;
      stats.nextSlot = getNextSlot();
      saveStats(stats);
      
      await sendMessage(chatId, `
🔄 <b>Contatore azzerato!</b>

🚗 Auto lavate: <b>0</b>
⏰ Prossimo slot: <b>${stats.nextSlot}</b>

<i>🎯 Sito aggiornato automaticamente!</i>
      `);
      break;
      
    case '/help':
      await sendMessage(chatId, `
🚗 <b>WashDrive Counter Bot - Guida</b>

<b>🚗 Auto:</b>
/auto - Registra un'auto lavata (+1)

<b>⏰ Slot:</b>
/slot - Mostra slot attuale
/slot 16:30 - Imposta slot specifico
/slot +1 - Aggiungi 1 ora
/slot +30 - Aggiungi 30 minuti
/slot auto - Calcola automaticamente

<b>👥 Operatori:</b>
/operatori - Mostra operatori attuali
/operatori 3 - Imposta numero operatori
/operatori +1 - Aggiungi operatore
/operatori -1 - Rimuovi operatore

<b>📊 Info:</b>
/stats - Mostra statistiche complete
/reset - Azzera contatore giornaliero

<b>✅ Tutto automatico!</b>
Il sito si aggiorna in tempo reale!
      `);
      break;
      
    default:
      await sendMessage(chatId, `
❓ Comando non riconosciuto: ${command}

Usa /help per vedere i comandi disponibili.
      `);
  }
}

// Polling per messaggi
async function getUpdates(offset = 0) {
  try {
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`,
      method: 'GET'
    };
    
    const response = await makeRequest(options);
    
    if (response.ok && response.result) {
      for (const update of response.result) {
        if (update.message) {
          const { chat, from, text } = update.message;
          
          if (text && text.startsWith('/')) {
            const [command, ...args] = text.split(' ');
            console.log(`📱 Comando ricevuto: ${command} da ${from.username || from.first_name}`);
            await handleCommand(chat.id, from.username || from.first_name, command, args);
          }
        }
        offset = Math.max(offset, update.update_id + 1);
      }
    }
    
    return offset;
  } catch (error) {
    console.error('Errore polling:', error);
    return offset;
  }
}

// Avvio bot
async function startBot() {
  console.log('🤖 WashDrive Telegram Bot avviato!');
  console.log('📱 Cerca il bot su Telegram e manda /start');
  console.log('✅ Sistema 100% automatico attivo!');
  
  // Server HTTP per Railway (evita sleep del servizio)
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'Bot Online',
        uptime: process.uptime(),
        lastUpdate: new Date().toISOString()
      }));
    } else if (req.url === '/stats') {
      const stats = loadStats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  
  server.listen(PORT, () => {
    console.log(`🌐 Server HTTP attivo su porta ${PORT}`);
  });
  
  let offset = 0;
  while (true) {
    try {
      offset = await getUpdates(offset);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Errore bot:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Avvia il bot
startBot();
