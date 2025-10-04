// Test semplice per il banner
console.log('🔧 Test banner iniziato...');

document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM caricato, inizializzo banner...');
  
  const bannerContent = document.getElementById('bannerContent');
  if (!bannerContent) {
    console.error('❌ Elemento bannerContent non trovato!');
    return;
  }
  
  console.log('✅ Elemento banner trovato:', bannerContent);
  
  // Dati semplici per il test
  const messages = [
    '🌤️ Meteo Pisa: Perfetto per lavaggio!',
    '⚡ Prenotazione in 30 secondi',
    '💧 Tecnologia waterless disponibile',
    '🚗 Servizio completo 45-90 minuti',
    '💬 WhatsApp sempre attivo',
    '🎯 Zero anticipo richiesto'
  ];
  
  // Crea HTML semplice
  const html = messages.map(msg => 
    `<span class="banner-item">
      <span class="banner-icon">${msg.split(' ')[0]}</span>
      ${msg.substring(2)}
    </span>`
  ).join('');
  
  bannerContent.innerHTML = html;
  console.log('✅ Banner HTML inserito:', html);
});