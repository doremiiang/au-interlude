import { MESSAGE_CONTACTS } from '../../data/apps.js';
import { iconSvg } from '../core/icons.js';

function appHeader(title, backLabel = 'Home') {
  return `<header class="app-header"><button class="app-back" type="button" data-action="back">‹ ${backLabel}</button><h2>${title}</h2><span class="app-header-spacer"></span></header>`;
}

function renderMessages() {
  const rows = MESSAGE_CONTACTS.map((person) => `
    <button class="app-list-row" type="button" data-contact="${person.id}">
      <span class="app-list-avatar">${person.initials}</span>
      <span class="app-list-copy"><strong>${person.name}</strong><span>${person.subtitle}</span></span>
      <span class="chevron">›</span>
    </button>`).join('');
  return `${appHeader('Messages')}<div class="app-list">${rows}</div><p class="app-empty-note">Daftar ini menggunakan data sementara. Isi chat AU akan ditambahkan pada tahap penulisan cerita.</p>`;
}

function renderThread(contactId) {
  const person = MESSAGE_CONTACTS.find((item) => item.id === contactId);
  if (!person) return renderMessages();
  return `${appHeader(person.name, 'Messages')}<div class="thread-empty"><div><div class="app-list-avatar" style="margin:0 auto 12px">${person.initials}</div><strong>${person.name}</strong><p>Belum ada percakapan.</p><p>Pesan akan ditambahkan nanti.</p></div></div>`;
}

function renderGeneric(app) {
  const descriptions = {
    photos: 'Galeri foto dan video Shaqil akan ditampilkan di sini.',
    camera: 'Antarmuka kamera akan dibuat pada tahap aplikasi.',
    instagram: 'Profil, feed, story, dan DM Instagram akan dibuat di tahap berikutnya.',
    twitter: 'Timeline, profil, dan interaksi X akan dibuat di tahap berikutnya.',
    music: 'Library musik dan pemutar audio akan dibuat di tahap berikutnya.',
    notes: 'Catatan pribadi Shaqil akan ditampilkan di sini.',
    calendar: 'Agenda dan kalender akan dibuat di tahap berikutnya.',
    settings: 'Pengaturan tampilan dan preferensi Interlude akan tersedia di sini.',
    safari: 'Browser simulasi akan dibuat di tahap berikutnya.',
    phone: 'Kontak dan riwayat panggilan akan dibuat di tahap berikutnya.',
    mail: 'Kotak masuk email akan dibuat di tahap berikutnya.'
  };
  return `${appHeader(app.name)}<div class="app-placeholder"><div class="app-placeholder-icon">${iconSvg(app.glyph)}</div><h3>${app.name}</h3><p>${descriptions[app.id] || 'Aplikasi ini sedang disiapkan.'}</p></div>`;
}

export function renderApp(app, surface, onClose) {
  let currentContact = null;
  const paint = () => {
    surface.innerHTML = app.id === 'messages'
      ? (currentContact ? renderThread(currentContact) : renderMessages())
      : renderGeneric(app);
  };
  const clickHandler = (event) => {
    if (event.target.closest('[data-action="back"]')) {
      if (currentContact) { currentContact = null; paint(); }
      else onClose();
      return;
    }
    const contactButton = event.target.closest('[data-contact]');
    if (contactButton) { currentContact = contactButton.dataset.contact; paint(); }
  };
  surface.addEventListener('click', clickHandler);
  paint();
  return () => surface.removeEventListener('click', clickHandler);
}
