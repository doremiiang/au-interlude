
/*
 * INTERLUDE — UPDATE MANAGER
 *
 * Menghubungkan Story Engine dengan sistem notifikasi.
 * Update hanya diumumkan jika Story Event sudah triggered
 * atau completed.
 */

import { on, emit } from './event-bus.js';
import { getEventStatus } from './story-state.js';

import { APPS } from '../../data/apps.js';
import { UPDATES } from '../../data/updates.js';

// Status event yang boleh membuka sebuah update.
const ELIGIBLE_STATUSES = new Set([
  'triggered',
  'completed'
]);

// ID aplikasi yang tersedia di Interlude.
const VALID_APP_IDS = new Set(
  APPS.map((app) => app.id)
);

// Mencegah update yang sama diumumkan berulang kali
// selama halaman masih terbuka.
let announcedUpdates = new Set();

// Menyimpan fungsi untuk membersihkan listener.
let cleanupListeners = [];

// Membuat salinan data agar data asli tidak berubah.
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Memastikan konfigurasi update valid.
function isValidUpdate(update) {
  return Boolean(
    update &&
    typeof update.id === 'string' &&
    update.id.trim() &&
    typeof update.storyEventId === 'string' &&
    update.storyEventId.trim() &&
    typeof update.appId === 'string' &&
    VALID_APP_IDS.has(update.appId) &&
    typeof update.contentId === 'string' &&
    update.contentId.trim()
  );
}

// Memeriksa apakah Story Event sudah benar-benar terpicu.
function isUpdateEligible(update) {
  if (!isValidUpdate(update)) return false;

  const status = getEventStatus(update.storyEventId);

  return ELIGIBLE_STATUSES.has(status);
}

// Mengambil seluruh update yang sudah memenuhi syarat.
export function getEligibleUpdates() {
  return UPDATES
    .filter(isUpdateEligible)
    .map(clone);
}

// Mengumumkan update yang belum pernah diumumkan
// selama sesi halaman ini.
function publishEligibleUpdates() {
  UPDATES.forEach((update) => {
    if (!isUpdateEligible(update)) return;

    if (announcedUpdates.has(update.id)) return;

    announcedUpdates.add(update.id);

    emit('update:available', {
      update: clone(update)
    });
  });
}

// Menginisialisasi Update Manager.
export function initUpdateManager() {
  // Bersihkan listener dari inisialisasi sebelumnya.
  cleanupUpdateManager();

  announcedUpdates = new Set();

  // Periksa update saat Story Event terpicu.
  cleanupListeners.push(
    on('story:event:triggered', publishEligibleUpdates)
  );

  // Periksa juga ketika event diselesaikan.
  cleanupListeners.push(
    on('story:event:completed', publishEligibleUpdates)
  );

  // Menangani update yang statusnya sudah tersimpan
  // sebelum halaman dibuka kembali.
  cleanupListeners.push(
    on('story-state:changed', publishEligibleUpdates)
  );

  // Saat cerita di-reset, izinkan update diperiksa ulang.
  cleanupListeners.push(
    on('story-state:reset', () => {
      announcedUpdates.clear();
      publishEligibleUpdates();
    })
  );

  // Periksa status awal saat manager dinyalakan.
  publishEligibleUpdates();

  console.info('Update Manager aktif.');

  return () => cleanupUpdateManager();
}

// Membersihkan seluruh listener Update Manager.
export function cleanupUpdateManager() {
  cleanupListeners.forEach((cleanup) => cleanup());

  cleanupListeners = [];
  announcedUpdates.clear();
}
