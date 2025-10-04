
function toWA(text){ 
  window.open("https://wa.me/393330000000?text="+encodeURIComponent(text),'_blank'); 
}
function handleBooking(e){ 
  e.preventDefault(); 
  const form = e.target; 
  const data = new FormData(form);
  const msg = Array.from(data.entries()).map(([k,v])=>`${k}: ${v}`).join('\n');
  const mailto = "mailto:washdrive@pec.it?subject=Richiesta%20WashDrive&body="+encodeURIComponent(msg);
  window.location.href = mailto;
}
document.addEventListener('DOMContentLoaded',()=>{
  const f = document.getElementById('booking-form'); if(f) f.addEventListener('submit', handleBooking);
});
