import { MESSAGE_CONTACTS } from '../../data/apps.js';
import { iconSvg } from '../core/icons.js';
import { renderMessages } from './messages.js';

const STORAGE_KEYS = {
  messages: 'interlude-messages-v1',
  notes: 'interlude-notes-v1',
  preferences: 'interlude-preferences-v1'
};

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Tidak dapat membaca ${key}:`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Tidak dapat menyimpan ${key}:`, error);
    return false;
  }
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(value) {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Intl.DateTimeFormat('id-ID', options).format(new Date(value));
}

function appHeader(title, right = '', backLabel = 'Home') {
  return `
    <header class="app-header">
      <button class="app-back" type="button" data-action="back" aria-label="Kembali ke ${escapeHTML(backLabel)}">‹ <span>${escapeHTML(backLabel)}</span></button>
      <h2>${escapeHTML(title)}</h2>
      <span class="app-header-action">${right}</span>
    </header>`;
}

function emptyState({ icon = 'message', title, description, action = '' }) {
  return `
    <div class="app-empty-state">
      <div class="app-empty-icon">${iconSvg(icon)}</div>
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(description)}</p>
      ${action}
    </div>`;
}

function getMessageStore() {
  const value = readStorage(STORAGE_KEYS.messages, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function renderContactRows(searchTerm = '') {
  const messages = getMessageStore();
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('id-ID');
  const filtered = MESSAGE_CONTACTS.filter((person) => {
    const history = Array.isArray(messages[person.id]) ? messages[person.id] : [];
    const lastMessage = history.at(-1)?.text || person.subtitle;
    return `${person.name} ${lastMessage}`.toLocaleLowerCase('id-ID').includes(normalizedSearch);
  });

  if (!filtered.length) {
    return emptyState({ icon: 'message', title: 'Tidak ditemukan', description: 'Coba kata kunci atau nama kontak lain.' });
  }

  return filtered.map((person) => {
    const history = Array.isArray(messages[person.id]) ? messages[person.id] : [];
    const lastMessage = history.at(-1);
    return `
      <button class="message-contact-row" type="button" data-contact="${escapeHTML(person.id)}">
        <span class="message-avatar">${escapeHTML(person.initials)}</span>
        <span class="message-contact-copy">
          <strong>${escapeHTML(person.name)}</strong>
          <span>${escapeHTML(lastMessage?.text || person.subtitle)}</span>
        </span>
        <span class="message-contact-meta">${lastMessage ? formatTime(lastMessage.createdAt) : '›'}</span>
      </button>`;
  }).join('');
}

function renderMessagesList(searchTerm = '') {
  return `${appHeader('Messages')}
    <section class="messages-screen">
      <div class="app-page-heading"><p class="app-eyebrow">YOUR CONVERSATIONS</p><h3>Messages</h3></div>
      <label class="app-search">
        <span aria-hidden="true">⌕</span>
        <input type="search" id="message-search" placeholder="Search" value="${escapeHTML(searchTerm)}" autocomplete="off" aria-label="Cari percakapan">
      </label>
      <div class="message-contact-list" id="message-contact-list">${renderContactRows(searchTerm)}</div>
    </section>`;
}

function renderMessageThread(contactId) {
  const person = MESSAGE_CONTACTS.find((item) => item.id === contactId);
  if (!person) return renderMessagesList();
  const store = getMessageStore();
  const history = Array.isArray(store[person.id]) ? store[person.id] : [];
  const conversation = history.length
    ? `<div class="message-bubbles">${history.map((message) => `
        <article class="message-bubble message-outgoing">
          <p>${escapeHTML(message.text)}</p><time>${formatTime(message.createdAt)}</time>
        </article>`).join('')}</div>`
    : emptyState({ icon: 'message', title: 'It’s quiet here', description: `Belum ada pesan dengan ${person.name}. Mulai percakapan kapan saja.` });

  return `${appHeader(person.name, '', 'Messages')}
    <section class="message-thread">
      <div class="thread-profile">
        <span class="message-avatar message-avatar-large">${escapeHTML(person.initials)}</span>
        <strong>${escapeHTML(person.name)}</strong>
        <span>Conversation</span>
      </div>
      <div class="thread-history" id="thread-history">${conversation}</div>
      <form class="message-composer" data-form="message">
        <label class="visually-hidden" for="message-compose-input">Tulis pesan</label>
        <input id="message-compose-input" name="message" type="text" maxlength="1000" placeholder="iMessage" autocomplete="off" required>
        <button type="submit" aria-label="Kirim pesan">↑</button>
      </form>
    </section>`;
}

function readNotes() {
  const notes = readStorage(STORAGE_KEYS.notes, []);
  return Array.isArray(notes) ? notes : [];
}

function renderNotesList() {
  const notes = readNotes().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const rows = notes.map((note) => `
    <button class="note-row" type="button" data-note-open="${escapeHTML(note.id)}">
      <span class="note-row-copy">
        <strong>${escapeHTML(note.title || 'Untitled')}</strong>
        <span>${escapeHTML(note.body || 'No additional text')}</span>
      </span>
      <time>${formatDate(note.updatedAt, { day: 'numeric', month: 'short' })}</time>
    </button>`).join('');
  const action = '<button class="app-primary-button" type="button" data-note-new>＋ New Note</button>';

  return `${appHeader('Notes')}
    <section class="notes-screen">
      <div class="app-page-heading"><p class="app-eyebrow">PERSONAL SPACE</p><h3>All Notes</h3><span>${notes.length} ${notes.length === 1 ? 'note' : 'notes'}</span></div>
      ${action}
      <div class="notes-list">${rows || emptyState({ icon: 'notes', title: 'No notes yet', description: 'Your thoughts and little reminders will live here.' })}</div>
    </section>`;
}

function renderNoteEditor(note) {
  const isNew = !note;
  return `${appHeader(isNew ? 'New Note' : 'Edit Note', '', 'Notes')}
    <form class="note-editor" data-form="note">
      <label class="visually-hidden" for="note-title">Judul catatan</label>
      <input id="note-title" name="title" class="note-title-input" type="text" maxlength="100" placeholder="Title" value="${escapeHTML(note?.title || '')}">
      <div class="note-editor-meta">${isNew ? 'New note' : `Edited ${formatDate(note.updatedAt)}`}</div>
      <label class="visually-hidden" for="note-body">Isi catatan</label>
      <textarea id="note-body" name="body" placeholder="Start writing...">${escapeHTML(note?.body || '')}</textarea>
      <div class="note-editor-actions">
        ${!isNew ? `<button class="app-text-button danger" type="button" data-note-delete="${escapeHTML(note.id)}">Delete</button>` : '<span></span>'}
        <button class="app-primary-button" type="submit">Save Note</button>
      </div>
    </form>`;
}

function renderCalendar(currentMonth, selectedDate) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const day = index - mondayOffset + 1;
    const inMonth = day >= 1 && day <= daysInMonth;
    const date = new Date(year, month, day);
    const selected = inMonth && date.toDateString() === selectedDate.toDateString();
    const today = inMonth && date.toDateString() === new Date().toDateString();
    return `<button class="calendar-day${inMonth ? '' : ' is-outside'}${selected ? ' is-selected' : ''}${today ? ' is-today' : ''}" type="button" ${inMonth ? `data-calendar-day="${day}"` : 'disabled'} aria-label="${inMonth ? escapeHTML(formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' })) : ''}" ${selected ? 'aria-pressed="true"' : 'aria-pressed="false"'}>${inMonth ? day : ''}</button>`;
  }).join('');
  const monthTitle = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentMonth);
  const selectedLabel = formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' });

  return `${appHeader('Calendar')}
    <section class="calendar-screen">
      <div class="calendar-month-heading">
        <div><p class="app-eyebrow">YOUR SCHEDULE</p><h3>${escapeHTML(monthTitle)}</h3></div>
        <div class="calendar-nav"><button type="button" data-calendar-shift="-1" aria-label="Bulan sebelumnya">‹</button><button type="button" data-calendar-shift="1" aria-label="Bulan berikutnya">›</button></div>
      </div>
      <div class="calendar-weekdays"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div>
      <div class="calendar-grid">${cells}</div>
      <button class="calendar-today-button" type="button" data-calendar-today>Today</button>
      <div class="calendar-agenda"><p class="app-eyebrow">SELECTED DAY</p><h4>${escapeHTML(selectedLabel)}</h4><p>Tidak ada agenda untuk hari ini.</p></div>
    </section>`;
}

function readPreferences() {
  const stored = readStorage(STORAGE_KEYS.preferences, {});
  return { notifications: true, sounds: true, darkMode: false, ...stored };
}

function renderSettings(preferences) {
  const settings = [
    { key: 'notifications', title: 'Notifications', description: 'Allow app notifications in this experience.' },
    { key: 'sounds', title: 'Sounds', description: 'Interface sound preference for future features.' },
    { key: 'darkMode', title: 'Dark Appearance', description: 'Use a darker look inside applications.' }
  ];
  const rows = settings.map((setting) => `
    <div class="setting-row">
      <span class="setting-copy"><strong>${setting.title}</strong><small>${setting.description}</small></span>
      <button class="setting-switch${preferences[setting.key] ? ' is-on' : ''}" type="button" role="switch" aria-checked="${Boolean(preferences[setting.key])}" data-setting="${setting.key}" aria-label="${setting.title}"><span></span></button>
    </div>`).join('');
  return `${appHeader('Settings')}
    <section class="settings-screen">
      <div class="settings-profile"><span class="settings-avatar">S</span><div><strong>Shaqil Naraya</strong><span>Interlude · iPhone</span></div></div>
      <p class="app-eyebrow settings-section-label">PREFERENCES</p>
      <div class="settings-group">${rows}</div>
      <p class="settings-footnote">Some preferences are visual settings for this simulator. Device-level permissions are not changed.</p>
    </section>`;
}

function renderCamera() {
  return `${appHeader('Camera')}
    <section class="camera-screen">
      <div class="camera-viewfinder" id="camera-viewfinder"><span class="camera-focus-frame"></span><span class="camera-preview-note">Camera preview simulation</span></div>
      <div class="camera-controls"><button type="button" class="camera-mode">PHOTO</button><button type="button" class="camera-shutter" data-camera-shutter aria-label="Take simulated photo"><span></span></button><button type="button" class="camera-mode">1×</button></div>
      <p class="camera-disclaimer">This is a visual camera mockup. It does not access your device camera or save photos.</p>
    </section>`;
}

function renderGeneric(app) {
  const copy = {
    photos: ['Your library is waiting', 'Photos and videos added to Shaqil’s library will appear here.'],
    instagram: ['Instagram is getting ready', 'The profile, stories, feed, and direct messages will be added in a later UI pass.'],
    twitter: ['Your timeline is quiet', 'Posts, replies, and profile views will be added after the app layout is ready.'],
    music: ['Nothing playing', 'The music library and audio player will be connected when the project audio assets are ready.'],
    safari: ['A little space to browse', 'The in-app browser interface will be built in a later pass.'],
    phone: ['No recent calls', 'Call history and contacts will appear here when that interface is added.'],
    mail: ['You’re all caught up', 'The inbox is empty for now. Email content will be added later.']
  };
  const [title, description] = copy[app.id] || ['Coming soon', 'This application is being prepared.'];
  return `${appHeader(app.name)}<section class="generic-app-screen">${emptyState({ icon: app.glyph, title, description })}</section>`;
}

export function renderApp(app, surface, onClose) {
  if (app.id === 'messages') {
    return renderMessages(surface, onClose);
  }

  let currentContact = null;
  let activeNoteId = null;
  let searchTerm = '';
  let currentMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  let selectedDate = new Date();
  let preferences = readPreferences();

  const paint = () => {
    surface.dataset.theme = preferences.darkMode ? 'dark' : 'light';
    if (surface.parentElement) surface.parentElement.dataset.theme = preferences.darkMode ? 'dark' : 'light';
    if (app.id === 'messages') {
      surface.innerHTML = currentContact ? renderMessageThread(currentContact) : renderMessagesList(searchTerm);
      if (currentContact) {
        const history = surface.querySelector('#thread-history');
        if (history) history.scrollTop = history.scrollHeight;
      }
      return;
    }
    if (app.id === 'notes') {
      const note = activeNoteId && activeNoteId !== '__new__' ? readNotes().find((item) => item.id === activeNoteId) : null;
      surface.innerHTML = activeNoteId ? renderNoteEditor(note) : renderNotesList();
      return;
    }
    if (app.id === 'calendar') { surface.innerHTML = renderCalendar(currentMonth, selectedDate); return; }
    if (app.id === 'settings') { surface.innerHTML = renderSettings(preferences); return; }
    if (app.id === 'camera') { surface.innerHTML = renderCamera(); return; }
    surface.innerHTML = renderGeneric(app);
  };

  const clickHandler = (event) => {
    const backButton = event.target.closest('[data-action="back"]');
    if (backButton) {
      if (app.id === 'messages' && currentContact) { currentContact = null; paint(); }
      else if (app.id === 'notes' && activeNoteId) { activeNoteId = null; paint(); }
      else onClose();
      return;
    }

    const contactButton = event.target.closest('[data-contact]');
    if (contactButton && app.id === 'messages') { currentContact = contactButton.dataset.contact; paint(); return; }

    const newNoteButton = event.target.closest('[data-note-new]');
    if (newNoteButton) { activeNoteId = '__new__'; paint(); surface.querySelector('#note-title')?.focus(); return; }

    const noteButton = event.target.closest('[data-note-open]');
    if (noteButton) { activeNoteId = noteButton.dataset.noteOpen; paint(); return; }

    const deleteNoteButton = event.target.closest('[data-note-delete]');
    if (deleteNoteButton) {
      const noteId = deleteNoteButton.dataset.noteDelete;
      const remaining = readNotes().filter((item) => item.id !== noteId);
      writeStorage(STORAGE_KEYS.notes, remaining);
      activeNoteId = null;
      paint();
      return;
    }

    const monthButton = event.target.closest('[data-calendar-shift]');
    if (monthButton) {
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + Number(monthButton.dataset.calendarShift), 1);
      const maxDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
      selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), Math.min(selectedDate.getDate(), maxDay));
      paint();
      return;
    }

    const dayButton = event.target.closest('[data-calendar-day]');
    if (dayButton) {
      selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), Number(dayButton.dataset.calendarDay));
      paint();
      return;
    }

    if (event.target.closest('[data-calendar-today]')) {
      selectedDate = new Date();
      currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      paint();
      return;
    }

    const settingButton = event.target.closest('[data-setting]');
    if (settingButton) {
      const key = settingButton.dataset.setting;
      preferences[key] = !preferences[key];
      writeStorage(STORAGE_KEYS.preferences, preferences);
      paint();
      return;
    }

    if (event.target.closest('[data-camera-shutter]')) {
      const viewfinder = surface.querySelector('#camera-viewfinder');
      viewfinder?.classList.add('is-captured');
      window.setTimeout(() => viewfinder?.classList.remove('is-captured'), 180);
    }
  };

  const submitHandler = (event) => {
    const messageForm = event.target.closest('form[data-form="message"]');
    if (messageForm && app.id === 'messages' && currentContact) {
      event.preventDefault();
      const input = messageForm.elements.message;
      const text = input.value.trim();
      if (!text) return;
      const store = getMessageStore();
      if (!Array.isArray(store[currentContact])) store[currentContact] = [];
      store[currentContact].push({ id: makeId(), text, createdAt: new Date().toISOString(), direction: 'outgoing' });
      writeStorage(STORAGE_KEYS.messages, store);
      paint();
      surface.querySelector('#message-compose-input')?.focus();
      return;
    }

    const noteForm = event.target.closest('form[data-form="note"]');
    if (noteForm && app.id === 'notes') {
      event.preventDefault();
      const title = noteForm.elements.title.value.trim();
      const body = noteForm.elements.body.value.trim();
      if (!title && !body) { activeNoteId = null; paint(); return; }
      const notes = readNotes();
      const now = new Date().toISOString();
      if (activeNoteId === '__new__') {
        notes.push({ id: makeId(), title, body, createdAt: now, updatedAt: now });
      } else {
        const index = notes.findIndex((item) => item.id === activeNoteId);
        if (index >= 0) notes[index] = { ...notes[index], title, body, updatedAt: now };
      }
      writeStorage(STORAGE_KEYS.notes, notes);
      activeNoteId = null;
      paint();
    }
  };

  const inputHandler = (event) => {
    if (event.target.id === 'message-search' && app.id === 'messages') {
      searchTerm = event.target.value;
      const list = surface.querySelector('#message-contact-list');
      if (list) list.innerHTML = renderContactRows(searchTerm);
    }
  };

  surface.addEventListener('click', clickHandler);
  surface.addEventListener('submit', submitHandler);
  surface.addEventListener('input', inputHandler);
  paint();

  return () => {
    surface.removeEventListener('click', clickHandler);
    surface.removeEventListener('submit', submitHandler);
    surface.removeEventListener('input', inputHandler);
    surface.dataset.theme = 'light';
    if (surface.parentElement) surface.parentElement.dataset.theme = 'light';
  };
}
