# WashDrive – Sito Statico / PWA

Sito promozionale per servizio di lavaggio & detailing auto a domicilio (Pisa). Stack minimale: HTML statico, Tailwind via CDN, JavaScript vanilla (un solo file principale) + Progressive Web App (manifest + service worker).

## 🌊 Waves Implementate
1. Cleanup & ottimizzazioni di base (rimozione duplicati, fix encoding, lazy logo, live region annunci recensioni).
2. Prenotazioni avanzate: calendario custom, slot da 30min, persistenza in LocalStorage, modal di conferma prima del salvataggio.
3. Accessibilità & Motion: rispetto `prefers-reduced-motion`, tastiera/ARIA per carousel recensioni, pausa/riavvio, annuncio slide.
4. SEO: Meta Open Graph, Twitter Card, JSON-LD base + AggregateRating dinamico.
5. PWA: `site.webmanifest`, `sw.js` con precache core e fallback offline.
6. Sicurezza client: honeypot, sanitizzazione, rate limit, debounce.
7. Refactor & Docs: rimozione log debug superflui, README aggiornato.

## ✨ Funzionalità
- Hero info carousel (auto-rotate disabilitato se ridotto movimento).
- Servizi e pacchetti generati dinamicamente.
- Sistema recensioni (LocalStorage):
    - Voto 0–5 ★, truncation/espansione testo, carousel accessibile.
    - AggregateRating JSON-LD generato runtime.
- Prenotazione con blocco slot già occupati e conferma.
- Modulo contatti (demo: nessun backend reale) + WhatsApp / call link.
- Cookie banner (solo tecnici) + pagine legali (privacy, cookie, termini).
- FAQ dinamiche, back-to-top, fallback offline PWA.

## 🔐 Sicurezza (client-side)
- Honeypot nascosto `website` nei form (booking/contatti; recensioni tramite modale).
- Sanitizzazione semplice (escape < > " ').
- Rate limiting: 15s recensioni, 5s booking/contatti.
- Disabilitazione pulsanti per 2.5s dopo invio per prevenire doppio click.

## ♿ Accessibilità
- Focus trap + ESC chiusura modale recensione.
- Navigazione tastiera (ArrowLeft/Right) nel carousel.
- Live region (`#reviewAnnouncer`) per annunciare slide.
- Color contrast e dimensioni leggibili.

## 📈 SEO & Structured Data
- Meta standard + Open Graph + Twitter Card.
- JSON-LD `AutoDetailing` con dati fiscali.
- JSON-LD `AggregateRating` generato se sono presenti recensioni.

## 📂 Struttura
```
index.html
privacy.html / cookie-policy.html / termini.html
js/landing.js
sw.js
site.webmanifest
assets/ (immagini, logo, gallery)
style.css (opzionale / override)
```

## � Storage Locale
- `wd_reviews`: array max 50 recensioni.
- `wd_bookings`: mappa date → slot occupati.
- `cookieConsent`: accepted/rejected.

## 🔧 Sviluppo Locale
Serve un server (no file:// per Service Worker). Esempio con Python:
```
python -m http.server 8080
```
Apri http://localhost:8080/

## 🧱 Aggiornare la Cache PWA
1. Modifica asset core.
2. Cambia `CACHE_VERSION` in `sw.js`.
3. Ricarica (puoi fare Hard Reload / Clear storage in DevTools se necessario).

## 🧩 Possibili Evoluzioni
- Backend per invio reale booking/recensioni (REST + code anti-abuso server-side).
- Background Sync / Notifiche push.
- Split `landing.js` in moduli (booking.js, reviews.js...).
- Miglior rating senza inline `onclick` (delegation) + validazione più robusta.
- UI tema chiaro/scuro toggle.

## ✅ Manutenzione Rapida
- Prezzi/pacchetti: modifica array in `setupPricingGrid()`.
- Servizi base: aggiornare sezione HTML o estrarre anche quella in JS.
- Recensioni iniziali di default: funzione `getDefaultReviews()`.

## ⚠️ Limitazioni
Tutto è client-side: dati non sincronizzati tra dispositivi; cancellando cache/localStorage si perdono recensioni e prenotazioni.

## 📞 Contatti
Telefono: +39 380 386 3461  ·  Email: washdrive25@gmail.com  ·  Instagram: @washdrive25
P.IVA IT02554240503 · CF CZZPIO00P27G795N · REA PI-269783

---
Creato con ❤️ per WashDrive – versione documentata (Wave 7).