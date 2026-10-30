
/*
 * INTERLUDE — NOTIFICATION MANAGER
 *
 * Mengelola notifikasi update di Home Screen.
 *
 * Fitur:
 * - Menerima update dari Update Manager.
 * - Menyimpan notifikasi ke localStorage.
 * - Menampilkan notifikasi yang belum dibaca.
 * - Mengirim event saat notifikasi dibuka.
 * - Menandai update sudah dibaca setelah kontennya dilihat.
 * - Menghapus notifikasi saat cerita di-reset.
 */

import { on, emit } from './event-bus.js';

import {
  initUpdateManager,
  cleanupUpdateManager
} from './update-manager.js';

import { APPS } from '../../data/apps.js';

// Kunci penyimpanan notifikasi.
const STORAGE_KEY = 'interlude-notifications-v1';

// Elemen HTML.
let notificationCenter = null;

// Data notifikasi.
let notifications = {};

// Fungsi cleanup listener.
let cleanupListeners = [];

// Status inisialisasi.
let isInitialized = false;

// Membuat salinan data.
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Membaca data notifikasi dari localStorage.
function loadNotifications() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return {};

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed;
  } catch (error) {
    console.warn(
      'Gagal membaca notifikasi:',
      error
    );

    return {};
  }
}

// Menyimpan data notifikasi.
function saveNotifications() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    );
  } catch (error) {
    console.warn(
      'Gagal menyimpan notifikasi:',
      error
    );
  }
}

// Mengambil nama aplikasi.
function getApp(appId) {
  return APPS.find((app) => app.id === appId) || null;
}

// Menambahkan notifikasi baru.
function addNotification(update) {
  if (!update || !update.id) return;

  // Jangan menggandakan notifikasi yang sudah ada.
  if (notifications[update.id]) return;

  notifications[update.id] = {
    update: clone(update),
    read: false,
    createdAt: new Date().toISOString(),
    readAt: null
  };

  saveNotifications();

  // Perbarui tampilan jika Home Screen sedang aktif.
  renderNotifications();
}

// Mengambil seluruh notifikasi.
export function getNotifications() {
  return Object.entries(notifications).map(
    ([id, item]) => ({
      id,
      ...clone(item)
    })
  );
}

// Mengambil notifikasi yang belum dibaca.
export function getUnreadNotifications() {
  return getNotifications().filter(
    (item) => !item.read
  );
}

// Menandai notifikasi sudah dibaca.
export function markNotificationAsRead(updateId) {
  const item = notifications[updateId];

  if (!item || item.read) return false;

  item.read = true;
  item.readAt = new Date().toISOString();

  saveNotifications();
  renderNotifications();

  emit('notification:read', {
    updateId
  });

  return true;
}

// Menandai update sudah dilihat.
// Bisa dipanggil menggunakan updateId,
// atau kombinasi appId dan contentId.
export function markUpdateAsViewed(payload = {}) {
  const { updateId, appId, contentId } = payload;

  const matchingIds = Object.entries(notifications)
    .filter(([id, item]) => {
      if (updateId) {
        return id === updateId;
      }

      return (
        item.update.appId === appId &&
        item.update.contentId === contentId
      );
    })
    .map(([id]) => id);

  matchingIds.forEach(markNotificationAsRead);

  return matchingIds.length;
}

// Membuat satu kartu notifikasi.
function createNotificationElement(item) {
  const update = item.update;
  const app = getApp(update.appId);

  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'notification-card';
  button.dataset.updateId = update.id;

  if (!item.read) {
    button.classList.add('is-unread');
  }

  const icon = document.createElement('span');
  icon.className = `notification-icon ${
    app?.color || 'default'
  }`;

  icon.textContent = app?.name?.charAt(0) || 'N';

  const copy = document.createElement('span');
  copy.className = 'notification-copy';

  const appName = document.createElement('strong');
  appName.textContent = app?.name || 'Notification';

  const title = document.createElement('span');
  title.className = 'notification-title';
  title.textContent = update.title || 'New update';

  const body = document.createElement('span');
  body.className = 'notification-body';
  body.textContent = update.body || '';

  copy.append(appName, title, body);

  const time = document.createElement('time');
  time.className = 'notification-time';
  time.textContent = update.timeLabel || 'now';

  button.append(icon, copy, time);

  button.addEventListener('click', () => {
    // Jangan langsung tandai dibaca.
    // Konten harus benar-benar dibuka terlebih dahulu.
    emit('notification:open', {
      update: clone(update)
    });
  });

  return button;
}

// Merender notifikasi yang belum dibaca.
export function renderNotifications() {
  if (!notificationCenter) return;

  const unread = getUnreadNotifications();

  notificationCenter.replaceChildren();

  if (unread.length === 0) {
    notificationCenter.hidden = true;
    return;
  }

  unread.forEach((item) => {
    notificationCenter.append(
      createNotificationElement(item)
    );
  });

  notificationCenter.hidden = false;
}

// Dipanggil ketika Home Screen sudah tampil.
function handleHomeReady() {
  renderNotifications();
}

// Menghapus seluruh notifikasi.
function clearNotifications() {
  notifications = {};
  saveNotifications();
  renderNotifications();
}

// Inisialisasi Notification Manager.
export function initNotificationManager() {
  // Cegah inisialisasi ganda.
  if (isInitialized) {
    cleanupNotificationManager();
  }

  notificationCenter = document.querySelector(
    '#notification-center'
  );

  if (!notificationCenter) {
    console.error(
      'Notification Center tidak ditemukan di HTML.'
    );

    return () => {};
  }

  notifications = loadNotifications();

  notificationCenter.hidden = true;

  // Terima update baru dari Update Manager.
  cleanupListeners.push(
    on('update:available', ({ update } = {}) => {
      addNotification(update);
    })
  );

  // Tandai update telah dilihat.
  cleanupListeners.push(
    on('update:content-viewed', markUpdateAsViewed)
  );

  // Reset notifikasi jika cerita diulang dari awal.
  cleanupListeners.push(
    on('story-state:reset', clearNotifications)
  );

  // Dengarkan saat Home Screen ditampilkan.
  window.addEventListener(
    'interlude:home-ready',
    handleHomeReady
  );

  // Simpan fungsi cleanup untuk event browser.
  cleanupListeners.push(() => {
    window.removeEventListener(
      'interlude:home-ready',
      handleHomeReady
    );
  });

  // Jalankan Update Manager setelah listener siap.
  cleanupUpdateManager();
  initUpdateManager();

  isInitialized = true;

  console.info('Notification Manager aktif.');

  return () => cleanupNotificationManager();
}

// Membersihkan Notification Manager.
export function cleanupNotificationManager() {
  cleanupListeners.forEach((cleanup) => cleanup());

  cleanupListeners = [];

  cleanupUpdateManager();

  if (notificationCenter) {
    notificationCenter.replaceChildren();
    notificationCenter.hidden = true;
  }

  notificationCenter = null;
  isInitialized = false;
}
