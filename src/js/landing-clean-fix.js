// WashDrive Landing Page Script - Fixed Encoding
(function() {
  'use strict';

  // Wave 3: preferenze movimento (riduce animazioni / auto-rotate)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Rilevamento dispositivo mobile per ottimizzazioni
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Configurazione base
  const config = {
    phone: '+393803863461',
    email: 'washdrive25@gmail.com',
    whatsapp: '393803863461'
  };

  // Inizializzazione quando il DOM è pronto
  document.addEventListener('DOMContentLoaded', init);
  // Dopo init, genera eventualmente AggregateRating (leggero timeout per assicurare lettura storage)
  document.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(()=>{
      try {
        const reviews = JSON.parse(localStorage.getItem('wd_reviews')||'[]').filter(r=>typeof r.rating==='number');
        if(reviews.length){
          const avg = (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(2);
          const script = document.getElementById('ldAggregateRating');
          if(script){
            script.textContent = JSON.stringify({
              '@context':'https://schema.org',
              '@type':'AggregateRating',
              'itemReviewed': {
                '@type':'Service',
                'name':'WashDrive Detailing a Domicilio'
              },
              'ratingValue': avg,
              'bestRating': '5',
              'worstRating': '1',
              'ratingCount': reviews.length
            });
          }
        }
      } catch {}
    }, 400);
  });

  function init() {
    console.log('🚀 Inizializzazione WashDrive...');
    setupNavigation();
    setupHeroInfoCarousel();
    setupPricingGrid();
    setupReviews();
    setupFAQ();
    loadStoredBookings();
    setupForms();
    setupContactInfo();
    setupMobileMenu();
    setCurrentYear();
    setupCookieBanner();
    
    // Carica statistiche live al caricamento della pagina
    loadLiveStats();
    
    // Aggiorna statistiche ogni 30 secondi
    setInterval(loadLiveStats, 30000);
    setupBackToTop();
    if(typeof enhanceBackToTopProgress === 'function') {
      enhanceBackToTopProgress();
    }
    setupBookingModal();
    initCustomSelects();
    // initMultiSelectDropdown(); // Spostato in openBookingModal()
    setupBookingDelegation(); // Aggiungi delegation di sicurezza
    console.log('✅ Inizializzazione completata');
  }

  // Wave 6: Security helpers
  const security = {
    lastReviewTs: 0,
    reviewMinInterval: 15000,
    lastBookingTs: 0,
    lastContactTs: 0,
    genericMinInterval: 5000
  };

  function sanitize(str){
    if(str==null) return '';
    return String(str)
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;')
      .trim();
  }

  // Toast notification system
  function showToast(message, type = 'info', duration = 4000) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    const toastId = 'toast_' + Date.now();
    toast.id = toastId;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const colors = {
      success: 'bg-green-600 border-green-500',
      error: 'bg-red-600 border-red-500', 
      warning: 'bg-orange-600 border-orange-500',
      info: 'bg-blue-600 border-blue-500'
    };
    
    toast.className = `fixed top-4 right-4 z-50 ${colors[type] || colors.info} text-white px-4 py-3 rounded-lg border-l-4 shadow-lg transform translate-x-full transition-all duration-300 max-w-sm`;
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-lg">${icons[type] || icons.info}</span>
        <span class="text-sm">${sanitize(message)}</span>
        <button onclick="closeToast('${toastId}')" class="ml-auto text-white/70 hover:text-white text-lg">&times;</button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Anima l'entrata
    setTimeout(() => toast.classList.remove('translate-x-full'), 10);
    
    // Auto-remove
    setTimeout(() => closeToast(toastId), duration);
    
    return toastId;
  }
  // Espone funzione globale per chiudere un toast specifico
  window.closeToast = function(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.classList.add('opacity-0','translate-x-full');
    setTimeout(()=> el.remove(), 300);
  };
  
  function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed top-0 right-0 z-50 p-4 space-y-2';
    document.body.appendChild(container);
    return container;
  }
  
  window.closeToast = function(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }
  };

  function honeypotTriggered(data){
    return data && typeof data.website === 'string' && data.website.trim() !== '';
  }
  function tooSoon(lastTs, minInterval){
    return Date.now() - lastTs < minInterval;
  }

  // Carousel hero con info e pacchetti - FIXED ENCODING
  function setupHeroInfoCarousel() {
    const slides = [
      { 
        type: 'live-stats',
        icon: '📊', 
        title: 'Statistiche Live', 
        subtitle: 'Dati in tempo reale',
        desc: 'Statistiche aggiornate automaticamente'
      },
      { 
        icon: '🚗', 
        title: 'Servizio a domicilio', 
        subtitle: 'Arriviamo noi da te',
        desc: 'Lavoriamo a casa tua, in ufficio o dove preferisci. Zero stress, zero code.'
      },
      { 
        icon: '🎯', 
        title: 'Smart Refresh', 
        subtitle: '€120 - Il più richiesto',
        desc: 'Lavaggio completo + interni + sanificazione ozono. Risultato professionale.'
      },
      { 
        icon: '💡', 
        title: 'La nostra storia', 
        subtitle: 'Nata dalla passione per l\'auto',
        desc: 'Stanchi delle lunghe attese agli autolavaggi, abbiamo pensato: perché non portare il servizio direttamente dal cliente? Così è nata WashDrive.'
      },
      { 
        icon: '🎨', 
        title: 'La nostra missione', 
        subtitle: 'Eccellenza e comodità',
        desc: 'Restituire alle vostre auto la brillantezza originale, con la comodità di un servizio professionale a domicilio.'
      },
      { 
        icon: '🌿', 
        title: 'Opzione Waterless', 
        subtitle: 'Eco-friendly',
        desc: 'Lavaggio a basso consumo d\'acqua per condomini e zone con restrizioni.'
      }
    ];

    const slidesContainer = document.getElementById('heroInfoSlides');
    const dotsContainer = document.getElementById('heroInfoDots');
    
    if (!slidesContainer || !dotsContainer) return;

    // Crea slides
    slides.forEach((slide, index) => {
      const slideEl = document.createElement('div');
      slideEl.className = 'hero-info-slide';
      slideEl.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
      
      if (slide.type === 'live-stats') {
        // Slide speciale per statistiche live
        slideEl.innerHTML = `
          <div class="text-center h-full flex flex-col justify-center p-6">
            <div class="text-4xl mb-4">📊</div>
            <div class="text-xl font-bold text-white mb-2">Statistiche Live</div>
            <div class="text-sm font-medium mb-6 hero-subtitle transition-colors duration-700 text-fuchsia-400 flex items-center justify-center gap-2">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Dati in tempo reale
            </div>
            <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div class="bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl p-3 border border-slate-700/50 backdrop-blur-sm">
                <div class="text-2xl font-bold text-amber-400" id="carsWashedToday">0</div>
                <div class="text-white/70 text-xs mt-1">Auto oggi</div>
              </div>
              <div class="bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl p-3 border border-slate-700/50 backdrop-blur-sm">
                <div class="text-2xl font-bold text-blue-400" id="nextSlot">16:30</div>
                <div class="text-white/70 text-xs mt-1">Prossimo slot</div>
              </div>
              <div class="bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl p-3 border border-slate-700/50 backdrop-blur-sm">
                <div class="text-2xl font-bold text-green-400" id="avgRating">4.9</div>
                <div class="text-white/70 text-xs mt-1">Rating medio</div>
              </div>
              <div class="bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl p-3 border border-slate-700/50 backdrop-blur-sm">
                <div class="text-2xl font-bold text-purple-400" id="activeTechs">1</div>
                <div class="text-white/70 text-xs mt-1">Operatori attivi</div>
              </div>
            </div>
          </div>
        `;
      } else {
        // Slide normale
        slideEl.innerHTML = `
          <div class="text-center">
            <div class="text-3xl mb-3">${slide.icon}</div>
            <div class="text-lg font-bold text-white mb-1">${slide.title}</div>
            <div class="text-xs font-medium mb-3 hero-subtitle transition-colors duration-700 text-amber-400">${slide.subtitle}</div>
            <div class="text-xs text-white/80 leading-relaxed px-2">${slide.desc}</div>
          </div>
        `;
      }
      
      slidesContainer.appendChild(slideEl);

      // Crea dot
      const dot = document.createElement('button');
      dot.setAttribute('aria-current', index === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => showSlide(index));
      dotsContainer.appendChild(dot);
    });

    let currentSlide = 0;
    // Palette di colori accent per i sottotitoli del carousel
    const accentColors = [
      'text-amber-400',
      'text-rose-400',
      'text-emerald-400',
      'text-sky-400',
      'text-fuchsia-400',
      'text-orange-400'
    ];
    const subtitleNodes = () => slidesContainer.querySelectorAll('.hero-subtitle');
    function applyAccentColor(index){
      const colorClass = accentColors[index % accentColors.length];
      const subs = subtitleNodes();
      subs.forEach(sub => {
        // Rimuovi eventuali vecchi colori
        accentColors.forEach(c => sub.classList.remove(c));
        sub.classList.add(colorClass);
      });
    }
    // Applica il primo colore iniziale
    applyAccentColor(0);
    
    function showSlide(index) {
      const allSlides = slidesContainer.querySelectorAll('.hero-info-slide');
      const allDots = dotsContainer.querySelectorAll('button');
      
      allSlides.forEach((slide, i) => {
        slide.setAttribute('aria-hidden', i !== index ? 'true' : 'false');
      });
      
      allDots.forEach((dot, i) => {
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
      
      currentSlide = index;
      applyAccentColor(index); // aggiorna colore dinamico con la slide
    }

    // Auto-rotate ogni 4 secondi (disattivato se utente preferisce ridurre movimento)
    if (!prefersReducedMotion) {
      setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      }, 4000);
    }
  }

  // Funzione per caricare statistiche live
  function loadLiveStats() {
    fetch('/stats.json')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(stats => {
        // Aggiorna gli elementi nel carousel
        const carsWashedEl = document.getElementById('carsWashedToday');
        const nextSlotEl = document.getElementById('nextSlot');
        const avgRatingEl = document.getElementById('avgRating');
        const activeTechsEl = document.getElementById('activeTechs');

        if (carsWashedEl) carsWashedEl.textContent = stats.carsWashed || 0;
        if (nextSlotEl) nextSlotEl.textContent = stats.nextSlot || '16:30';
        if (avgRatingEl) avgRatingEl.textContent = stats.avgRating || '4.9';
        if (activeTechsEl) activeTechsEl.textContent = stats.activeTechs || 1;

        console.log('✅ Statistiche live aggiornate:', stats);
      })
      .catch(error => {
        console.warn('⚠️ Errore nel caricamento statistiche:', error);
        // Mantieni valori di default se il caricamento fallisce
      });
  }

  // Navigazione smooth scroll
  function setupNavigation() {
    const navButtons = document.querySelectorAll('[data-scrollto]');
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(button.dataset.scrollto);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Griglia prezzi - FIXED ENCODING
  function setupPricingGrid() {
    const pricing = [
      {
        name: 'Soft Clean',
        price: '€35-50',
        popular: false,
        features: ['Lavaggio a mano', 'Aspirazione rapida', 'Plastiche interne', 'Perfetto per mantenimento']
      },
      {
        name: 'Smart Refresh',
        price: 'da €120',
        popular: true,
        features: ['Lavaggio completo', 'Pulizia interni + plastiche', 'Sanificazione ozono', 'Risultato professionale']
      },
      {
        name: 'Decontamination',
        price: '€150-200',
        popular: false,
        features: ['Lavaggio + clay/chimica', 'Cerchi & dettagli esterni', 'Finitura protettiva', 'Rimozione contaminanti']
      },
      {
        name: 'Shine & Protect',
        price: '€280-400',
        popular: false,
        features: ['Decontam. completa', 'Lucidatura one-step', 'Sigillante/cera ceramica', 'Protezione duratura']
      },
      {
        name: 'Premium Detail',
        price: '€500-700',
        popular: false,
        features: ['Full interni/esterni', 'Lucidatura multi-step', 'Protezione nano 12-36 mesi', 'Servizio premium completo']
      },
      {
        name: 'Ceramic Elite',
        price: 'da €850',
        popular: false,
        features: ['Lucidatura correttiva completa', 'Coating multi layer 3-5 anni', 'Garanzia brillantezza', 'Massima protezione']
      }
    ];

    const grid = document.getElementById('pricingGrid');
    if (!grid) {
      console.error('🚫 Pricing grid element not found');
      return;
    }

    // Clear any existing content first
    grid.innerHTML = '';
    
    console.log('📋 Setting up pricing grid with', pricing.length, 'services');

    pricing.forEach((service, index) => {
      const card = document.createElement('div');
      card.className = `pricing-card rounded-2xl border border-slate-800 p-6 bg-slate-900/30 relative transition-all hover:border-slate-700 ${service.popular ? 'ring-1 ring-white/20' : ''}`;
      
      card.innerHTML = `
        ${service.popular ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs px-3 py-1 rounded-full font-medium">Più richiesto</div>' : ''}
        <div class="text-xl font-bold">${service.name}</div>
        <ul class="mt-3 space-y-2 text-sm text-white/70">
          ${service.features.map(feature => `<li class="flex items-center gap-2">✓ ${feature}</li>`).join('')}
        </ul>
        <div class="text-2xl font-bold mt-4 text-amber-400">${service.price}</div>
        <button class="select-service-btn w-full mt-6 rounded-xl border border-slate-700 px-4 py-3 hover:bg-slate-800 transition text-sm" data-service="${service.name}">Seleziona</button>
      `;
      
      grid.appendChild(card);
      console.log(`✅ Added card ${index + 1}: ${service.name}`);
    });

    // Gestione selezione evidenziata + prefill
    grid.querySelectorAll('.select-service-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const serviceName = btn.getAttribute('data-service');
        // Rimuovi highlight precedente
        grid.querySelectorAll('.pricing-card').forEach(c => c.classList.remove('ring-2','ring-amber-400/60','shadow-xl'));
        // Aggiungi highlight alla card corrente
        const parentCard = btn.closest('.pricing-card');
        if(parentCard){
          parentCard.classList.add('ring-2','ring-amber-400/60','shadow-xl');
          setTimeout(()=> parentCard.scrollIntoView({behavior:'smooth',block:'center'}), 50);
        }
        // Prefill nel modal (servizio)
        const servizioWrapper = document.querySelector('[data-wd-select="servizio"]');
        if(servizioWrapper){
          const hiddenInput = servizioWrapper.querySelector('input[type="hidden"]');
          const label = servizioWrapper.querySelector('.wd-select-label');
          // Prova match con opzione esistente che inizia col nome pacchetto
          const options = Array.from(servizioWrapper.querySelectorAll('.wd-option'));
          const found = options.find(o => (o.getAttribute('data-value')||'').toLowerCase().startsWith(serviceName.toLowerCase()));
          if(found){
            options.forEach(o=>o.setAttribute('aria-selected','false'));
            found.setAttribute('aria-selected','true');
            hiddenInput.value = found.getAttribute('data-value');
            label.textContent = found.textContent.trim();
            label.classList.remove('text-slate-400');
          }
        }
        // Apri modal prenotazione direttamente
        openBookingModal();
      });
    });
  }

  // Aggiorna href dinamici call e WhatsApp
  function updateQuickActions(){
    const callLink = document.getElementById('callLink');
    const waLink = document.getElementById('waBtn');
    const ctaWa = document.getElementById('ctaWaBtn');
    const phoneDigits = (config.whatsapp||config.phone||'').replace(/[^0-9]/g,'');
    
    function bindWa(el){
      if(!el || el.dataset.boundWa) return;
      el.addEventListener('click', (e)=>{
        e.preventDefault();
        const form = document.getElementById('bookingForm');
        let msg = 'Ciao! Vorrei prenotare un servizio di detailing.';
        if(form){
          try {
            const fd = new FormData(form);
            const nome = (fd.get('nome')||'').toString().trim();
            const servizio = (fd.get('servizio')||'').toString().trim();
            if(nome) msg += `\nNome: ${nome}`;
            if(servizio) msg += `\nServizio: ${servizio}`;
          } catch {}
        }
        msg += '\nInviato da WashDrive.it';
        const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`;
        window.location.href = url;
      });
      el.dataset.boundWa = 'true';
    }
    bindWa(waLink);
    bindWa(ctaWa);

    // Pulsante flottante WhatsApp mobile - FIXED EMOJI
    if(!document.getElementById('waFloat')){
      const float = document.createElement('a');
      float.id='waFloat';
      float.href='#';
      float.setAttribute('aria-label','Contattaci su WhatsApp');
      float.className='fixed z-50 bottom-5 right-5 rounded-full bg-green-500 text-slate-900 w-14 h-14 shadow-lg shadow-green-500/30 flex items-center justify-center text-2xl hover:bg-green-400 transition';
      float.innerHTML='💬';
      document.body.appendChild(float);
      bindWa(float);
    }
  }

  // Form handling semplificato
  function setupForms() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      updateQuickActions();
    }
  }

  // Info contatti
  function setupContactInfo() {
    const phoneSpans = document.querySelectorAll('#phoneSpan');
    const emailSpans = document.querySelectorAll('#emailSpan, #emailSpan2');

    phoneSpans.forEach(span => span.textContent = config.phone);
    emailSpans.forEach(span => span.textContent = config.email);
  }

  // ================== RECENSIONI (ripristinate) ==================
  let reviewRotationTimer = null;
  let currentReviewIndex = 0;

  function loadReviews() {
    try {
      const raw = localStorage.getItem('wd_reviews');
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.slice(0, 50) : [];
    } catch { return []; }
  }
  function saveReviews(list) {
    try { localStorage.setItem('wd_reviews', JSON.stringify(list.slice(0,50))); } catch {}
  }
  function migrateReviewTimestamps(list) {
    if (!Array.isArray(list)) return [];
    if (!list.some(r => r && r.createdAt == null)) return list;
    const base = Date.now();
    return list.map((r,i) => ({ ...r, createdAt: r.createdAt || (base - i * 60000) }));
  }

  function setupReviews() {
    const container = document.getElementById('reviews');
    if (!container) return;

    container.innerHTML = `
      <div id="reviewsCarousel" class="relative group" tabindex="0" aria-label="Carousel recensioni">
        <div class="absolute -top-7 left-0 text-xs text-white/50" id="reviewsSummary"></div>
        <div id="reviewSlides" class="overflow-hidden relative h-[230px]"></div>
        <button type="button" id="revPrev" aria-label="Precedente" class="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 -left-3 bg-slate-800/70 hover:bg-slate-700 text-white w-8 h-8 rounded-full items-center justify-center text-sm">‹</button>
        <button type="button" id="revNext" aria-label="Successivo" class="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 -right-3 bg-slate-800/70 hover:bg-slate-700 text-white w-8 h-8 rounded-full items-center justify-center text-sm">›</button>
        <div id="reviewDots" class="flex gap-2 justify-center mt-4"></div>
        <div id="reviewCounter" class="absolute -bottom-6 right-0 text-[10px] tracking-wide text-white/40"></div>
      </div>`;

    let stored = loadReviews();
    // Rimuovi eventuali seed di demo (Luca / Sara)
    if (stored.length && stored.every(r => r && ['Luca','Sara'].includes(r.name))) {
      try { localStorage.removeItem('wd_reviews'); } catch {}
      stored = [];
    }
    let reviews = stored;
    if (reviews.length) {
      reviews = migrateReviewTimestamps(reviews);
      saveReviews(reviews);
    }
    renderReviewsCarousel(reviews);
    initReviewControlsAccessibility();
  if (!prefersReducedMotion) startReviewRotation();

    // Swipe mobile (touch) per cambiare recensione
    (function initSwipe(){
      const holder = document.getElementById('reviewSlides');
      if(!holder || holder.dataset.swipeBound) return;
      let touchStartX = 0, touchEndX = 0, touchStartY = 0, touchMoved = false;
      holder.addEventListener('touchstart', e=>{
        if(e.touches.length!==1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
      }, {passive:true});
      holder.addEventListener('touchmove', e=>{
        if(e.touches.length!==1) return;
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if(dx > 8) touchMoved = true; // orizzontale
        if(touchMoved && dx > dy) e.preventDefault();
      }, {passive:false});
      holder.addEventListener('touchend', e=>{
        if(!touchMoved) return;
        touchEndX = e.changedTouches[0].clientX;
        const delta = touchEndX - touchStartX;
        if(Math.abs(delta) < 40) return; // soglia
        if(delta < 0) { // swipe left -> next
          showReviewSlide((currentReviewIndex+1) % Math.max(1, loadReviews().length));
        } else { // swipe right -> prev
          const listLen = Math.max(1, loadReviews().length);
            showReviewSlide((currentReviewIndex - 1 + listLen) % listLen);
        }
      });
      holder.dataset.swipeBound = 'true';
    })();

    // Pulsante per aggiungere recensione
    let staticBtn = document.getElementById('addReviewBtnStatic');
    if (!staticBtn) {
      staticBtn = document.createElement('button');
      staticBtn.id = 'addReviewBtnStatic';
      staticBtn.type = 'button';
      staticBtn.setAttribute('aria-label', 'Aggiungi una recensione');
      // Restyle button: same color as background (subtle), no border
      staticBtn.className = 'mt-8 w-full rounded-xl bg-slate-900/30 hover:bg-slate-800 text-white text-sm font-medium py-3 transition flex items-center justify-center gap-2';
      staticBtn.innerHTML = '<span class="text-lg text-amber-400">★</span><span>Lascia una recensione</span>';
      container.appendChild(staticBtn);
    }
    if (!staticBtn.dataset.bound) {
      staticBtn.addEventListener('click', (e)=>{ e.preventDefault(); openReviewForm(); });
      staticBtn.dataset.bound = 'true';
    }
  }

  function renderReviewsCarousel(reviews) {
    const slidesHolder = document.getElementById('reviewSlides');
    const dotsHolder = document.getElementById('reviewDots');
    if (!slidesHolder || !dotsHolder) return;
    const slidesData = [...reviews];
    slidesHolder.innerHTML = '';
    dotsHolder.innerHTML = '';
    if (!slidesData.length) {
      const placeholder = document.createElement('div');
      placeholder.className = 'absolute inset-0 flex flex-col items-center justify-center text-center rounded-2xl border border-slate-800 p-6 bg-slate-900/30';
      placeholder.innerHTML = '<div class="text-white/60 text-sm">Ancora nessuna recensione.<br><span class="text-amber-400">Scrivi la prima!</span></div>';
      slidesHolder.appendChild(placeholder);
      return;
    }
    slidesData.forEach((rev, idx) => {
      const slide = document.createElement('div');
      slide.className = 'absolute inset-0 transition-opacity duration-600 ease-out opacity-0';
      slide.setAttribute('data-index', idx);
      if (idx === 0) slide.classList.remove('opacity-0');
      const rating = typeof rev.rating === 'number' ? Math.max(0, Math.min(5, rev.rating)) : 0;
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'numeric' }) : '';
      const fullText = (rev.text || '').toString();
      const needsTruncate = fullText.length > 160;
      const truncated = needsTruncate ? fullText.slice(0,160).trim() + '…' : fullText;
      const announceText = `Recensione ${idx+1} di ${slidesData.length}: ${rev.name || 'Anonimo'}, ${rating} stelle`;
      slide.setAttribute('data-announce', announceText);
      slide.innerHTML = `
        <div class="rounded-2xl border border-slate-800 p-6 bg-slate-900/30 h-full flex flex-col">
          <div class="font-medium text-sm mb-1 flex items-center gap-2"><span>${sanitize(rev.name||'Anonimo')}</span>${dateStr?`<span class=\"text-[10px] font-normal text-white/40\">${dateStr}</span>`:''}</div>
          <div class="text-yellow-400 text-sm">${stars}</div>
          <div class="mt-3 text-white/70 text-sm flex-1">
            <p class="review-text" data-full="${fullText.replace(/"/g,'&quot;')}" data-truncated="${truncated.replace(/"/g,'&quot;')}" data-state="truncated">"${truncated}"</p>
            ${needsTruncate ? '<button type="button" class="mt-2 text-xs text-amber-400 underline review-toggle">Mostra tutto</button>' : ''}
          </div>
        </div>`;
      slidesHolder.appendChild(slide);
      const dot = document.createElement('button');
      dot.className = 'h-2 w-2 rounded-full bg-white/25 hover:bg-white/60 transition';
      if (idx === 0) dot.classList.add('!bg-white');
      dot.addEventListener('click', () => showReviewSlide(idx));
      dotsHolder.appendChild(dot);
    });
    // Toggle full text
    slidesHolder.querySelectorAll('.review-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.parentElement.querySelector('.review-text');
        if (!p) return;
        const state = p.getAttribute('data-state');
        if (state === 'truncated') {
          p.textContent = '"' + p.getAttribute('data-full') + '"';
          p.setAttribute('data-state','full');
          btn.textContent = 'Mostra meno';
        } else {
          p.textContent = '"' + p.getAttribute('data-truncated') + '"';
          p.setAttribute('data-state','truncated');
          btn.textContent = 'Mostra tutto';
        }
      });
    });
    updateReviewCounter();
  }

  function showReviewSlide(index) {
    const slides = document.querySelectorAll('#reviewSlides > div');
    const dots = document.querySelectorAll('#reviewDots > button');
    if (!slides.length) return;
    slides.forEach(s => s.classList.add('opacity-0'));
    const active = slides[index];
    if (active) active.classList.remove('opacity-0');
    dots.forEach(d => d.classList.remove('!bg-white'));
    if (dots[index]) dots[index].classList.add('!bg-white');
    currentReviewIndex = index;
    updateReviewCounter();
    const announcer = document.getElementById('reviewAnnouncer');
    if (announcer && active) announcer.textContent = active.getAttribute('data-announce') || '';
  }
  function startReviewRotation() {
    if (reviewRotationTimer) clearInterval(reviewRotationTimer);
    reviewRotationTimer = setInterval(() => {
      const slides = document.querySelectorAll('#reviewSlides > div');
      if (slides.length <= 1) return; // no rotation needed if single or none
      const next = (currentReviewIndex + 1) % slides.length;
      showReviewSlide(next);
    }, 5000);
  }
  function initReviewControlsAccessibility(){
    const carousel = document.getElementById('reviewsCarousel');
    if (!carousel) return;
    // Keyboard navigation only (pause toggle removed for continuous rotation)
    carousel.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowRight') { e.preventDefault(); const slides = document.querySelectorAll('#reviewSlides > div'); if(slides.length){ showReviewSlide((currentReviewIndex+1)%slides.length);} }
      if (e.key === 'ArrowLeft') { e.preventDefault(); const slides = document.querySelectorAll('#reviewSlides > div'); if(slides.length){ showReviewSlide((currentReviewIndex-1+slides.length)%slides.length);} }
    });
  }
  function updateReviewCounter() {
    const counter = document.getElementById('reviewCounter');
    const slides = document.querySelectorAll('#reviewSlides > div');
    if (!counter || !slides.length) return;
    counter.textContent = `${currentReviewIndex+1} / ${slides.length}`;
  }
  function openReviewForm() {
    const existingForm = document.getElementById('reviewModal');
    if (existingForm) existingForm.remove();
    const modal = document.createElement('div');
    modal.id = 'reviewModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm';
    modal.innerHTML = `
      <div role="dialog" aria-modal="true" aria-labelledby="revTitle" class="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 id="revTitle" class="text-xl font-semibold text-white">Lascia una recensione</h3>
          <button type="button" data-close class="text-white/60 hover:text-white text-2xl" aria-label="Chiudi">&times;</button>
        </div>
        <form id="reviewForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white/80 mb-2">Il tuo nome</label>
            <input type="text" name="name" required class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Es. Mario R." autofocus>
          </div>
          <div>
            <label class="block text-sm font-medium text-white/80 mb-2">Valutazione</label>
            <div class="flex gap-1" id="starRating" aria-label="Valutazione stelle (0-5)">
              ${[1,2,3,4,5].map(i => `<button type=\"button\" class=\"text-2xl text-slate-600 hover:text-yellow-400 transition-colors\" onclick=\"setRating(${i})\" aria-label=\"${i} stelle\">☆</button>`).join('')}
            </div>
            <input type="hidden" name="rating" id="ratingValue" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-white/80 mb-2">La tua recensione</label>
            <textarea name="review" required rows="4" class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Racconta la tua esperienza con WashDrive..."></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="flex-1 rounded-xl bg-amber-500 text-slate-900 px-4 py-3 font-medium hover:bg-amber-400 transition text-sm">Invia recensione</button>
            <button type="button" data-close class="rounded-xl border border-slate-700 px-4 py-3 hover:bg-slate-800 transition text-sm">Annulla</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e=>{ if(e.target===modal) closeReviewForm(); });
    modal.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click', closeReviewForm));
    const form = document.getElementById('reviewForm');
    if(form) form.addEventListener('submit', handleReviewSubmit);
  }
  window.closeReviewForm = function() {
    const modal = document.getElementById('reviewModal');
    if(modal) modal.remove();
  };
  window.setRating = function(val){
    const ratingInput = document.getElementById('ratingValue'); if(ratingInput) ratingInput.value = val;
    const stars = document.querySelectorAll('#starRating button');
    stars.forEach((btn,i)=>{
      btn.textContent = (i < val) ? '★' : '☆';
      btn.classList.toggle('text-yellow-400', i < val);
      btn.classList.toggle('text-slate-600', i >= val);
    });
  };
  function handleReviewSubmit(ev){
    ev.preventDefault();
    const form = ev.target;
    const fd = new FormData(form);
    const raw = Object.fromEntries(fd);
    if(honeypotTriggered(raw)) { console.warn('[Security] Review honeypot trigger'); return; }
    if(tooSoon(security.lastReviewTs, security.reviewMinInterval)) { showToast('Attendi un momento prima di inviare un\'altra recensione.', 'warning'); return; }
    let name = sanitize(raw.name||'Anonimo');
    let rating = parseInt(raw.rating,10); if(isNaN(rating)|| rating<0) rating=0; if(rating>5) rating=5;
    let text = sanitize(raw.review||'');
    if(!text) { showToast('Inserisci il testo della recensione.', 'error'); return; }
    const existing = loadReviews();
    existing.unshift({ name, rating, text, createdAt: Date.now() });
    saveReviews(existing);
    security.lastReviewTs = Date.now();
    closeReviewForm();
    renderReviewsCarousel(existing);
    if(!prefersReducedMotion) startReviewRotation();
    showToast('Recensione salvata con successo!', 'success');
  }

  // ================== FINE RECENSIONI ==================

  // Stub per FAQ & altre funzioni complete nella versione estesa
  function setupFAQ() { /* stub */ }
  function loadStoredBookings() { /* stub */ }
  function setupMobileMenu() { /* stub */ }
  function setCurrentYear() { 
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  }
  function setupCookieBanner() { /* stub */ }
  function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) btn.classList.remove('hidden'); else btn.classList.add('hidden');
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  // Miglioramento: anello progressione scroll attorno al bottone
  function enhanceBackToTopProgress(){
    const btn = document.getElementById('backToTop');
    if(!btn || btn.dataset.progressEnhanced) return;
    // Inserisce SVG circolare sotto la freccia
    btn.innerHTML = `
      <svg class="absolute inset-0 w-full h-full" viewBox="0 0 36 36" aria-hidden="true">
        <path class="text-slate-300/20" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31" />
        <path id="btpProgress" class="text-amber-400" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31" stroke-dasharray="97.4" stroke-dashoffset="97.4" />
      </svg>
      <span class="relative z-10 text-lg leading-none">↑</span>`;
    btn.style.position='relative';
    const circLen = 97.4; // lunghezza path (approssimata)
    function onScroll(){
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const winHeight = window.innerHeight;
      const maxScroll = docHeight - winHeight;
      const ratio = maxScroll>0 ? Math.min(1, scrollTop / maxScroll) : 0;
      const offset = circLen - (ratio * circLen);
      const p = document.getElementById('btpProgress');
      if(p) p.setAttribute('stroke-dashoffset', offset.toFixed(2));
    }
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
    btn.dataset.progressEnhanced = 'true';
  }
  function setupBookingModal() {
    const modal = document.getElementById('bookingModal');
    if(!modal) return; // markup già presente in index.html

    // Apri modal per elementi con data-open-booking
    document.querySelectorAll('[data-open-booking]').forEach(btn => {
      if(btn.dataset.boundBooking) return;
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        openBookingModal();
      });
      btn.dataset.boundBooking = 'true';
    });

    // Chiudi modal
    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
      if(btn.dataset.boundClose) return;
      btn.addEventListener('click', closeBookingModal);
      btn.dataset.boundClose = 'true';
    });
    modal.addEventListener('click', e=>{ if(e.target === modal) closeBookingModal(); });

    const form = document.getElementById('bookingForm');
    if(form && !form.dataset.boundSubmit){
      form.addEventListener('submit', handleBookingSubmit);
      form.dataset.boundSubmit = 'true';
      
      // Aggiungi validazione real-time
      setupRealTimeValidation(form);
    }
  }
  
  // Validazione real-time per migliorare UX
  function setupRealTimeValidation(form) {
    const fields = form.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
      // Validazione on blur (quando l'utente esce dal campo)
      field.addEventListener('blur', () => validateField(field));
      
      // Validazione on input per alcuni campi specifici
      if (field.type === 'email' || field.type === 'tel' || field.name === 'telefono') {
        field.addEventListener('input', () => {
          clearTimeout(field.validationTimer);
          field.validationTimer = setTimeout(() => validateField(field), 500);
        });
      }
    });
  }
  
  function validateField(field) {
    const value = field.value.trim();
    const fieldContainer = field.closest('.space-y-1') || field.closest('fieldset') || field.parentNode;
    
    // Rimuovi messaggi precedenti
    clearFieldValidation(fieldContainer);
    
    // Reset stili
    field.classList.remove('form-field-error', 'form-field-success');
    
    if (field.hasAttribute('required') && !value) {
      showFieldError(field, fieldContainer, 'Questo campo è obbligatorio');
      return false;
    }
    
    // Validazioni specifiche
    switch (field.name) {
      case 'telefono':
        if (value && !isValidPhone(value)) {
          showFieldError(field, fieldContainer, 'Inserisci un numero di telefono valido');
          return false;
        }
        break;
        
      case 'modello':
        if (value && value.length < 2) {
          showFieldError(field, fieldContainer, 'Inserisci almeno 2 caratteri');
          return false;
        }
        break;
        
      case 'data':
        if (value && !isValidDate(value)) {
          showFieldError(field, fieldContainer, 'Seleziona una data valida');
          return false;
        }
        break;
    }
    
    // Se arriviamo qui, il campo è valido
    if (value) {
      showFieldSuccess(field, fieldContainer);
    }
    
    return true;
  }
  
  function showFieldError(field, container, message) {
    field.classList.add('form-field-error');
    
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error-message';
    errorEl.textContent = message;
    container.appendChild(errorEl);
  }
  
  function showFieldSuccess(field, container) {
    field.classList.add('form-field-success');
  }
  
  function clearFieldValidation(container) {
    const messages = container.querySelectorAll('.field-error-message, .field-success-message');
    messages.forEach(msg => msg.remove());
  }
  
  function isValidPhone(phone) {
    // Regex per numeri di telefono italiani
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  
  function isValidDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }
  
  function resetSubmitButton(btn, originalText) {
    btn.classList.remove('btn-loading');
    btn.innerHTML = originalText;
  }
  
  // Delegation di sicurezza (fallback) se per qualche motivo il listener diretto non si aggancia
  function setupBookingDelegation() {
    if(!window._wdBookingCloseDelegation){
      document.addEventListener('click', (e)=>{
        const target = e.target;
        if(target && target.matches('[data-close-modal]')){
          e.preventDefault();
          closeBookingModal();
        }
      });
      document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape'){
          const modal = document.getElementById('bookingModal');
          const isOpen = modal && !modal.classList.contains('hidden');
          if(isOpen) closeBookingModal();
        }
      });
      window._wdBookingCloseDelegation = true;
    }
  }

  function openBookingModal(){
    const modal = document.getElementById('bookingModal');
    if(!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    
    // Test debug - verifica che questa funzione viene chiamata
    console.log('🚀 Modal aperto, inizializzo multi-select...');
    
    // Inizializza il multi-select dopo apertura modal
    setTimeout(() => {
      console.log('🔄 Inizializzazione multi-select dopo apertura modal');
      initMultiSelectDropdown();
    }, 200);
  }
  function closeBookingModal(){
    const modal = document.getElementById('bookingModal');
    if(!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  }
  function handleBookingSubmit(e){
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Mostra loading state
    submitBtn.classList.add('btn-loading');
    submitBtn.innerHTML = '<span class="loading-spinner"></span>Invio in corso...';
    
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    // Raccoglie servizi extra selezionati (multipli da hidden inputs)
    const serviziExtra = fd.getAll('servizi_extra').filter(s => s.length > 0);
    
    if(honeypotTriggered(data)) { 
      console.warn('[Security] Booking honeypot'); 
      resetSubmitButton(submitBtn, originalBtnText);
      return; 
    }
    if(tooSoon(security.lastBookingTs, security.genericMinInterval)) { 
      showToast('Attendi un momento prima di inviare di nuovo.', 'warning'); 
      resetSubmitButton(submitBtn, originalBtnText);
      return; 
    }

    // Validazione minima
    if(!data.modello){ 
      showToast('Inserisci marca/modello.', 'error'); 
      resetSubmitButton(submitBtn, originalBtnText);
      return; 
    }
    if(!data.telefono){ 
      showToast('Inserisci un numero di telefono.', 'error'); 
      resetSubmitButton(submitBtn, originalBtnText);
      return; 
    }
    if(!data.pacchetto_principale){ 
      showToast('Seleziona un pacchetto principale.', 'error'); 
      resetSubmitButton(submitBtn, originalBtnText);
      return; 
    }

    // reCAPTCHA v3 validation
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.ready(() => {
        grecaptcha.execute('6LdRFIQpAAAAAH_reCAPTCHA_SITE_KEY', {action: 'booking_submit'})
          .then((token) => {
            // Token reCAPTCHA ottenuto, procedi con l'invio
            processBookingSubmission(data, serviziExtra, submitBtn, originalBtnText, token);
          })
          .catch(() => {
            showToast('Errore di sicurezza. Riprova.', 'error');
            resetSubmitButton(submitBtn, originalBtnText);
          });
      });
    } else {
      // Fallback se reCAPTCHA non è disponibile
      processBookingSubmission(data, serviziExtra, submitBtn, originalBtnText, null);
    }
  }
  
  function processBookingSubmission(data, serviziExtra, submitBtn, originalBtnText, recaptchaToken) {

    security.lastBookingTs = Date.now();
    
    // Tracciamento Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'booking_submit', {
        event_category: 'engagement',
        event_label: data.pacchetto_principale,
        value: 1,
        custom_parameters: {
          servizi_extra_count: serviziExtra.length,
          location: data.localita || 'not_specified'
        }
      });
    }
    
    try {
      const storedRaw = localStorage.getItem('wd_bookings');
      const arr = storedRaw ? JSON.parse(storedRaw) : [];
      arr.unshift({
        id: 'bk_' + Date.now(),
        modello: (data.modello||'').toString().trim(),
        data: data.data||'',
        ora: data.ora||'',
        localita: data.localita||'',
        telefono: data.telefono||'',
        pacchetto_principale: data.pacchetto_principale||'',
        servizi_extra: serviziExtra,
        note: (data.note||'').toString().trim(),
        recaptcha_token: recaptchaToken,
        createdAt: Date.now()
      });
      localStorage.setItem('wd_bookings', JSON.stringify(arr.slice(0,100)));
    } catch {}

    showToast('Richiesta salvata: apertura WhatsApp…', 'success');
    resetSubmitButton(submitBtn, originalBtnText);
    
    // Prepara messaggio WhatsApp
    const phoneDigits = (config.whatsapp||config.phone||'').replace(/[^0-9]/g,'');
    const serviziExtraText = serviziExtra.length > 0 ? `%0A🔧 Servizi Extra: ${encodeURIComponent(serviziExtra.join(', '))}` : '';
    
    // Formatta la data in giorno/mese/anno
    let dataFormattata = data.data || '-';
    if (data.data) {
      const dateObj = new Date(data.data);
      const giorno = dateObj.getDate().toString().padStart(2, '0');
      const mese = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const anno = dateObj.getFullYear();
      dataFormattata = `${giorno}/${mese}/${anno}`;
    }
    
    const msg = `🚗 NUOVA PRENOTAZIONE WASHDRIVE%0A%0A` +
      `📞 Telefono: ${encodeURIComponent(data.telefono)}%0A` +
      `📍 Indirizzo: ${encodeURIComponent(data.localita||'-')}%0A` +
      `🔧 Servizio: ${encodeURIComponent(data.pacchetto_principale||'-')}${serviziExtraText}%0A` +
      `📅 Data: ${encodeURIComponent(dataFormattata)}%0A` +
      `🕐 Orario: ${encodeURIComponent(data.ora||'-')}%0A` +
      `🏛️ In Toscana: ${encodeURIComponent(data.toscana === 'si' ? 'Sì' : data.toscana === 'no' ? 'No' : '-')}%0A` +
      `🏠 Spazio privato: ${encodeURIComponent(data.spazio_privato === 'si' ? 'Sì' : data.spazio_privato === 'no' ? 'No' : '-')}%0A` +
      `🚗 Modello: ${encodeURIComponent(data.modello)}` +
      (data.note ? `%0A📝 Note: ${encodeURIComponent(data.note)}` : '');
    const waUrl = `https://wa.me/${phoneDigits}?text=${msg}`;

    // Fallback email (mailto)
    const mailSubject = encodeURIComponent(`🚗 NUOVA PRENOTAZIONE WASHDRIVE - ${data.modello}`);
    const serviziExtraEmailText = serviziExtra.length > 0 ? `\n🔧 Servizi Extra: ${serviziExtra.join(', ')}` : '';
    const mailBody = `🚗 NUOVA PRENOTAZIONE WASHDRIVE\n\n` +
      `📞 Telefono: ${data.telefono}\n` +
      `📍 Indirizzo: ${data.localita||'-'}\n` +
      `🔧 Servizio: ${data.pacchetto_principale||'-'}${serviziExtraEmailText}\n` +
      `📅 Data: ${dataFormattata}\n` +
      `🕐 Orario: ${data.ora||'-'}\n` +
      `🏛️ In Toscana: ${data.toscana === 'si' ? 'Sì' : data.toscana === 'no' ? 'No' : '-'}\n` +
      `🏠 Spazio privato: ${data.spazio_privato === 'si' ? 'Sì' : data.spazio_privato === 'no' ? 'No' : '-'}\n` +
      `🚗 Modello: ${data.modello}` +
      (data.note ? `\n📝 Note: ${data.note}` : '');
    const mailLink = `mailto:${config.email}?subject=${mailSubject}&body=${encodeURIComponent(mailBody)}`;

    // Apri WhatsApp subito
    closeBookingModal();
    setTimeout(()=>{ window.location.href = waUrl; }, 150);

    // Mostra popup fallback se l'utente ritorna senza inviare (difficile da rilevare, offriamo manualmente un banner)
    setTimeout(()=>{
      if(!document.getElementById('bookingFallbackBar')){
        const bar = document.createElement('div');
        bar.id = 'bookingFallbackBar';
        bar.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800/90 border border-slate-600 rounded-xl px-5 py-3 flex items-center gap-4 text-xs text-white shadow-xl';
        bar.innerHTML = `<span class="text-white/70">Non si è aperto WhatsApp?</span>
          <button id="bfwMail" class="rounded-lg bg-amber-500 text-slate-900 px-3 py-1 font-medium text-[11px] hover:bg-amber-400">Invia Email</button>
          <button id="bfwClose" class="text-white/50 hover:text-white text-lg leading-none">&times;</button>`;
        document.body.appendChild(bar);
        document.getElementById('bfwMail').addEventListener('click', ()=>{ window.location.href = mailLink; });
        document.getElementById('bfwClose').addEventListener('click', ()=> bar.remove());
        setTimeout(()=>{ bar.classList.add('opacity-0','pointer-events-none'); setTimeout(()=>bar.remove(),6000); }, 10000);
      }
    }, 4000);

    // Aggiorna pannellino elenco prenotazioni se esiste
    updateBookingListPanel();
  }
  function initCustomSelects() {
    const wrappers = document.querySelectorAll('.wd-select-wrapper');
    wrappers.forEach(wrapper => {
      if(wrapper.dataset.enhanced) return; // già inizializzato
      const trigger = wrapper.querySelector('[data-trigger]');
      const menu = wrapper.querySelector('.wd-select-menu');
      const label = wrapper.querySelector('.wd-select-label');
      const hiddenInput = wrapper.querySelector('input[type="hidden"]');
      if(!trigger || !menu || !label || !hiddenInput) return;

      // Funzione per bloccare touch sulla pagina
      function preventPageTouch(e) {
        // Permetti touch solo dentro il dropdown
        if (!menu.contains(e.target) && !trigger.contains(e.target)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      function openMenu(){
        menu.classList.remove('hidden');
        trigger.setAttribute('aria-expanded','true');
        document.addEventListener('click', onDocumentClick, { capture: true });
        // Previeni scroll del body su mobile
        const scrollY = window.scrollY;
        document.body.dataset.scrollY = scrollY;
        document.body.classList.add('dropdown-open');
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        
        // Blocca touch events sulla pagina
        document.addEventListener('touchstart', preventPageTouch, { passive: false });
        document.addEventListener('touchmove', preventPageTouch, { passive: false });
        document.addEventListener('wheel', preventPageTouch, { passive: false });
        document.addEventListener('gesturestart', preventPageTouch, { passive: false });
        document.addEventListener('gesturechange', preventPageTouch, { passive: false });
      }
      function closeMenu(){
        menu.classList.add('hidden');
        trigger.setAttribute('aria-expanded','false');
        document.removeEventListener('click', onDocumentClick, { capture: true });
        // Ripristina scroll del body
        const scrollY = document.body.dataset.scrollY;
        document.body.classList.remove('dropdown-open');
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        if(scrollY) window.scrollTo(0, parseInt(scrollY || '0'));
        
        // Rimuovi blocco touch events
        document.removeEventListener('touchstart', preventPageTouch, { passive: false });
        document.removeEventListener('touchmove', preventPageTouch, { passive: false });
        document.removeEventListener('wheel', preventPageTouch, { passive: false });
        document.removeEventListener('gesturestart', preventPageTouch, { passive: false });
        document.removeEventListener('gesturechange', preventPageTouch, { passive: false });
      }
      function toggleMenu(){
        if(menu.classList.contains('hidden')) openMenu(); else closeMenu();
      }
      function onDocumentClick(e){
        if(!wrapper.contains(e.target)) closeMenu();
      }

      trigger.addEventListener('click', (e)=>{ e.preventDefault(); toggleMenu(); });
      trigger.addEventListener('keydown', (e)=>{
        if(e.key==='ArrowDown'){ e.preventDefault(); openMenu(); }
        if(e.key==='Escape'){ closeMenu(); }
      });

      // Selezione opzioni
      menu.querySelectorAll('.wd-option').forEach(opt => {
        opt.setAttribute('role','option');
        opt.tabIndex = -1; // per eventuale focus programmatico
        opt.addEventListener('click', ()=>{
          const value = opt.getAttribute('data-value') || '';
            hiddenInput.value = value;
            label.textContent = opt.textContent.trim();
            label.classList.remove('text-slate-400');
            // aria-selected reset
            menu.querySelectorAll('.wd-option').forEach(o=>o.setAttribute('aria-selected','false'));
            opt.setAttribute('aria-selected','true');
            closeMenu();
        });
      });

      // Gestione scroll touch per mobile
      const scrollContainer = menu.querySelector('.wd-select-scroll');
      if(scrollContainer) {
        scrollContainer.addEventListener('touchstart', (e) => {
          e.stopPropagation();
        }, { passive: true });
        
        scrollContainer.addEventListener('touchmove', (e) => {
          e.stopPropagation();
        }, { passive: true });
      }

      // Chiusura con ESC anche dal wrapper
      wrapper.addEventListener('keydown', (e)=>{
        if(e.key==='Escape') { closeMenu(); trigger.focus(); }
      });

      wrapper.dataset.enhanced = 'true';
    });
  }

  // ================== PANNELLO PRENOTAZIONI LOCALI ==================
  function updateBookingListPanel(){
    let panel = document.getElementById('bookingListPanel');
    if(!panel){
      panel = document.createElement('div');
      panel.id = 'bookingListPanel';
      panel.className = 'fixed bottom-4 right-4 z-40 w-72 max-h-[60vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/90 backdrop-blur shadow-xl text-xs text-white flex flex-col';
      panel.innerHTML = `<div class="flex items-center justify-between px-3 py-2 border-b border-slate-700 text-[11px] uppercase tracking-wide">
        <span>Prenotazioni (locale)</span>
        <div class="flex items-center gap-2">
          <button id="bkRefresh" class="text-white/50 hover:text-white" title="Aggiorna">⟳</button>
          <button id="bkToggle" class="text-white/50 hover:text-white" title="Comprimi">−</button>
          <button id="bkClose" class="text-white/50 hover:text-white" title="Chiudi">×</button>
        </div>
      </div><div id="bkScroll" class="overflow-y-auto flex-1 p-2 space-y-2"></div>`;
      document.body.appendChild(panel);
      panel.querySelector('#bkClose').addEventListener('click', ()=> panel.remove());
      panel.querySelector('#bkToggle').addEventListener('click', ()=>{
        const sc = panel.querySelector('#bkScroll');
        const btn = panel.querySelector('#bkToggle');
        if(sc.classList.contains('hidden')) { sc.classList.remove('hidden'); btn.textContent='−'; }
        else { sc.classList.add('hidden'); btn.textContent='+'; }
      });
      panel.querySelector('#bkRefresh').addEventListener('click', ()=> renderBookings());
    }
    renderBookings();
  }
  function renderBookings(){
    const holder = document.getElementById('bkScroll');
    if(!holder) return;
    let list = [];
    try { list = JSON.parse(localStorage.getItem('wd_bookings')||'[]'); } catch {}
    holder.innerHTML = '';
    if(!list.length){ holder.innerHTML = '<div class="text-white/50 text-[11px] italic">Nessuna prenotazione locale</div>'; return; }
    list.slice(0,30).forEach(b => {
      const div = document.createElement('div');
      div.className = 'rounded-lg border border-slate-700/60 p-2 bg-slate-800/40';
      const dt = b.createdAt ? new Date(b.createdAt).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '';
      div.innerHTML = `<div class="font-semibold text-[11px] mb-1">${escapeHtml(b.modello||'-')} <span class="text-white/40 font-normal">${dt}</span></div>
        <div class="space-y-0.5">
          <div><span class="text-white/40">Servizio:</span> ${escapeHtml(b.servizio||'-')}</div>
          <div><span class="text-white/40">Data/Ora:</span> ${escapeHtml((b.data||'-') + (b.ora?(' '+b.ora):''))}</div>
          ${b.note ? `<div><span class=\"text-white/40\">Note:</span> ${escapeHtml(b.note)}</div>` : ''}
          <div><span class="text-white/40">Tel:</span> ${escapeHtml(b.telefono||'-')}</div>
          <div><button class="dup-booking mt-1 px-2 py-0.5 text-[10px] rounded bg-slate-700/60 hover:bg-slate-600 text-white/80" data-id="${b.id}">Duplica</button></div>
        </div>`;
      holder.appendChild(div);
    });
    holder.querySelectorAll('.dup-booking').forEach(btn => {
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-id');
        const all = list;
        const found = all.find(x=>x.id===id);
        if(!found) return;
        // Prefill modal
        openBookingModal();
        const form = document.getElementById('bookingForm');
        if(!form) return;
        form.querySelector('[name="modello"]').value = found.modello||'';
        form.querySelector('[name="data"]').value = found.data||'';
        // Custom select orario
        if(found.ora){
          const oraWrapper = document.querySelector('[data-wd-select="ora"]');
          if(oraWrapper){
            const hidden = oraWrapper.querySelector('input[type="hidden"]');
            const label = oraWrapper.querySelector('.wd-select-label');
            const opt = Array.from(oraWrapper.querySelectorAll('.wd-option')).find(o=>o.getAttribute('data-value')===found.ora);
            if(opt && hidden && label){
              hidden.value = found.ora;
              label.textContent = opt.textContent.trim();
              label.classList.remove('text-slate-400');
              oraWrapper.querySelectorAll('.wd-option').forEach(o=>o.setAttribute('aria-selected','false'));
              opt.setAttribute('aria-selected','true');
            }
          }
        }
        form.querySelector('[name="localita"]').value = found.localita||'';
        form.querySelector('[name="telefono"]').value = found.telefono||'';
        form.querySelector('[name="note"]').value = found.note||'';
        // Servizio custom select
        if(found.servizio){
          const servWrapper = document.querySelector('[data-wd-select="servizio"]');
          if(servWrapper){
            const hidden = servWrapper.querySelector('input[type="hidden"]');
            const label = servWrapper.querySelector('.wd-select-label');
            const opt = Array.from(servWrapper.querySelectorAll('.wd-option')).find(o=>o.getAttribute('data-value')===found.servizio);
            if(opt && hidden && label){
              hidden.value = found.servizio;
              label.textContent = opt.textContent.trim();
              label.classList.remove('text-slate-400');
              servWrapper.querySelectorAll('.wd-option').forEach(o=>o.setAttribute('aria-selected','false'));
              opt.setAttribute('aria-selected','true');
            }
          }
        }
        showToast('Prenotazione duplicata, modifica i campi e invia.', 'info');
      });
    });
  }
  function escapeHtml(str){
    return (str||'').toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }
  // ================== FINE PANNELLO PRENOTAZIONI ==================

  // Expose global function for service selection
  window.selectService = function(serviceName) {
    showToast(`Servizio ${serviceName} selezionato! Scorri in basso per prenotare.`, 'success');
    setTimeout(() => {
      const contactSection = document.querySelector('#contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  // Multi-select custom per servizi extra
  function initMultiSelectDropdown() {
    console.log('🔍 Inizializzo multi-select dropdown...');
    
    const wrapper = document.querySelector('.wd-multi-select-wrapper');
    const display = document.querySelector('.wd-multi-select-display');
    const dropdown = document.querySelector('.wd-multi-dropdown');
    const displayText = document.querySelector('.wd-display-text');
    const hiddenInputs = document.querySelector('.wd-hidden-inputs');
    
    console.log('📦 Elementi trovati:', {
      wrapper: !!wrapper,
      display: !!display,
      dropdown: !!dropdown,
      displayText: !!displayText,
      hiddenInputs: !!hiddenInputs
    });
    
    if (!wrapper || !display || !dropdown || !displayText || !hiddenInputs) {
      console.error('❌ Mancano elementi per multi-select');
      return;
    }
    
    // Rimuovi eventuali listener precedenti
    const newDisplay = display.cloneNode(true);
    display.parentNode.replaceChild(newDisplay, display);
    
    // Aggiorna i riferimenti agli elementi
    const currentDisplay = document.querySelector('.wd-multi-select-display');
    const currentDropdown = document.querySelector('.wd-multi-dropdown');
    const currentDisplayText = document.querySelector('.wd-display-text');
    const currentWrapper = document.querySelector('.wd-multi-select-wrapper');
    
    console.log('🚀 Inizializzazione eventi multi-select...');
    
    let selectedValues = [];
    
    // Toggle dropdown
    currentDisplay.addEventListener('click', (e) => {
      console.log('🖱️ Click su display');
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = !currentDropdown.classList.contains('hidden');
      console.log('📋 Stato dropdown:', isOpen ? 'aperto' : 'chiuso');
      
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });
    
    // Handle option clicks
    currentDropdown.addEventListener('click', (e) => {
      const option = e.target.closest('.wd-multi-option');
      if (!option) return;
      
      e.stopPropagation();
      
      const value = option.dataset.value;
      
      // Handle "Nessun servizio extra" option
      if (value === '') {
        selectedValues = [];
        updateSelections();
        updateDisplay();
        updateHiddenInputs();
        return;
      }
      
      // Toggle regular options
      const index = selectedValues.indexOf(value);
      if (index > -1) {
        selectedValues.splice(index, 1);
      } else {
        selectedValues.push(value);
      }
      
      updateSelections();
      updateDisplay();
      updateHiddenInputs();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!currentWrapper.contains(e.target)) {
        closeDropdown();
      }
    });
    
    // Keyboard support
    currentDisplay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        currentDisplay.click();
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });
    
    function openDropdown() {
      currentDropdown.classList.remove('hidden');
      currentWrapper.classList.add('open');
      currentDisplay.setAttribute('aria-expanded', 'true');
    }
    
    function closeDropdown() {
      currentDropdown.classList.add('hidden');
      currentWrapper.classList.remove('open');
      currentDisplay.setAttribute('aria-expanded', 'false');
    }
    
    function updateSelections() {
      const options = currentDropdown.querySelectorAll('.wd-multi-option');
      options.forEach(option => {
        const value = option.dataset.value;
        if (value === '' && selectedValues.length === 0) {
          option.classList.add('selected');
        } else if (selectedValues.includes(value)) {
          option.classList.add('selected');
        } else {
          option.classList.remove('selected');
        }
      });
    }
    
    function updateDisplay() {
      if (selectedValues.length === 0) {
        currentDisplayText.textContent = 'Nessun servizio extra selezionato';
        currentDisplayText.style.color = '#6b7680';
      } else if (selectedValues.length === 1) {
        currentDisplayText.textContent = selectedValues[0];
        currentDisplayText.style.color = '#e2e8f0';
      } else {
        currentDisplayText.textContent = `${selectedValues.length} servizi extra selezionati`;
        currentDisplayText.style.color = '#e2e8f0';
      }
    }
    
    function updateHiddenInputs() {
      hiddenInputs.innerHTML = '';
      
      selectedValues.forEach(value => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'servizi_extra';
        input.value = value;
        hiddenInputs.appendChild(input);
      });
    }
    
    // Initialize
    updateSelections();
    updateDisplay();
    updateHiddenInputs();
    
    // Make display focusable
    currentDisplay.setAttribute('tabindex', '0');
    currentDisplay.setAttribute('role', 'combobox');
    currentDisplay.setAttribute('aria-expanded', 'false');
    currentDisplay.setAttribute('aria-haspopup', 'listbox');
    currentDisplay.setAttribute('aria-labelledby', 'servizi-extra-label');
  }

})();