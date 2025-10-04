// Server Web per WashDrive
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Server HTTP
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Security: previeni directory traversal
  if (filePath.includes('..') && !req.url.startsWith('/')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Se il file non esiste, prova con index.html (SPA routing)
  if (!fs.existsSync(filePath) && req.url !== '/') {
    filePath = path.join(__dirname, 'index.html');
  }
  
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('404 - File Not Found');
      return;
    }
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🌐 WashDrive server attivo su porta ${PORT}`);
  console.log(`📊 Bot Telegram e sito web online!`);
  
  // Avvia anche il bot Telegram
  require('./telegram-bot.js');
});

// Health check endpoint per Railway
server.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
  }
});