// Banner Test Semplice - Updated per fix cache
(function() {
  'use strict';
  
  function initSimpleBanner() {
    console.log('🔧 Inizializzazione banner semplice...');
    
    const bannerContent = document.getElementById('bannerContent');
    if (!bannerContent) {
      console.error('❌ Banner container non trovato!');
      return;
    }
    
    const items = [
      '🌤️ Meteo Pisa: Perfetto per lavaggio!',
      '⚡ Prenotazione in 30 secondi',
      '💧 Tecnologia waterless disponibile',
      '🚗 Servizio completo 45-90 minuti',
      '💬 WhatsApp sempre attivo',
      '🎯 Zero anticipo richiesto',
      '🌿 Prodotti eco-compatibili',
      '🏆 Oltre 500 clienti soddisfatti',
      '🔧 Attrezzatura professionale',
      '💎 Detailing premium disponibile',
      '🏠 A domicilio ovunque',
      '🛡️ Assicurazione completa',
      '📍 Raggio 25km da Pisa',
      '💰 Tariffe trasparenti',
      '🌟 Garanzia soddisfatti o rimborsati',
      '🚙 Tutti i tipi di veicoli',
      '🧽 Sanificazione anti-batterica',
      '⭐ Rating 4.8/5 stelle'
    ];
    
    function updateBanner() {
      const hour = new Date().getHours();
      const time = new Date().toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'});
      
      // Aggiungi informazioni dinamiche
      const dynamicItems = [
        `🕐 Aggiornato alle ${time}`,
        `☀️ Pisa ora: ${Math.round(18 + Math.sin((hour - 6) * Math.PI / 12) * 4)}°C - Condizioni ottime`,
        hour >= 8 && hour <= 17 ? '🟢 Team disponibile ora!' : '🔴 Team chiuso - Prenota per domani'
      ];
      
      // Carica statistiche live da stats.json
      fetch('/stats.json')
        .then(response => response.json())
        .then(stats => {
          const liveStats = [
            `🚗 Auto lavate oggi: ${stats.carsWashed}`,
            `⏰ Prossimo slot: ${stats.nextSlot}`,
            `⭐ Rating: ${stats.avgRating}/5.0`,
            `👥 Tecnici attivi: ${stats.activeTechs}`
          ];
          
          const allItems = [...dynamicItems, ...liveStats, ...items];
          
          const html = allItems.map(item => 
            `<span class="banner-item">
              <span class="banner-icon">${item.slice(0, 2)}</span>
              ${item.slice(3)}
            </span>`
          ).join('');
          
          bannerContent.innerHTML = html;
          console.log('✅ Banner aggiornato con statistiche live:', stats);
        })
        .catch(err => {
          console.warn('⚠️ Statistiche non disponibili, uso dati statici:', err);
          const allItems = [...dynamicItems, ...items];
          
          const html = allItems.map(item => 
            `<span class="banner-item">
              <span class="banner-icon">${item.slice(0, 2)}</span>
              ${item.slice(3)}
            </span>`
          ).join('');
          
          bannerContent.innerHTML = html;
          console.log('✅ Banner aggiornato con dati statici');
        });
    }
    
    // Avvia immediatamente
    updateBanner();
    
    // Aggiorna ogni minuto
    setInterval(updateBanner, 60000);
    
    console.log('🎉 Banner attivo!');
  }
  
  // Avvia quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimpleBanner);
  } else {
    initSimpleBanner();
  }
  
})();