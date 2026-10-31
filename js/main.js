import { APPS } from '../data/apps.js';
import { iconSvg } from './core/icons.js';
import { startClock } from './core/clock.js';
import { initLockScreen } from './core/lockscreen.js';
import { initStoryEngine } from './core/story-engine.js';
import { initNotificationManager } from './core/notification-manager.js';
import { on } from './core/event-bus.js';

import {
  hasStartedStory,
  isStoryCompleted,
  startStory,
  resetStoryState
} from './core/story-state.js';

// ==========================================
// 1. ELEMEN UTAMA DAN STATE
// ==========================================

const homeScreen = document.querySelector('#home-screen');
const appLayer = document.querySelector('#app-layer');
const appSurface = document.querySelector('#app-surface');
const homeIndicator = document.querySelector('#home-indicator');
const lockScreen = document.querySelector('#lock-screen');
const storyMenu = document.querySelector('#story-menu');
const storyMenuActions = document.querySelector('#story-menu-actions');
const notificationCenter = document.querySelector('#notification-center');

let cleanupCurrentApp = null;
let currentApp = null;
let appLoadToken = 0;

// ==========================================
// 2. VALIDASI ELEMEN HTML
// ==========================================

function validateRequiredElements() {
  const requiredElements = {
    homeScreen,
    appLayer,
    appSurface,
    homeIndicator,
    lockScreen,
    storyMenu,
    storyMenuActions,
    notificationCenter
  };

  const missingElements = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error(
      'Elemen HTML yang dibutuhkan tidak ditemukan:',
      missingElements.join(', ')
    );

    return false;
  }

  return true;
}

// ==========================================
// 3. STORY MENU
// ==========================================

function updateStoryMenu() {
  if (!storyMenuActions) return;

  const newButton = storyMenuActions.querySelector(
    '[data-story-action="new"]'
  );

  const continueButton = storyMenuActions.querySelector(
    '[data-story-action="continue"]'
  );

  const checkpointButton = storyMenuActions.querySelector(
    '[data-story-action="checkpoints"]'
  );

  const restartButton = storyMenuActions.querySelector(
    '[data-story-action="restart"]'
  );

  const started = hasStartedStory();
  const completed = isStoryCompleted();

  if (newButton) {
    newButton.textContent = completed ? 'Replay Story' : 'New Story';
    newButton.hidden = started && !completed;
  }

  if (continueButton) {
    continueButton.hidden = !started || completed;
  }

  if (checkpointButton) {
    checkpointButton.hidden = !started;

    // Selector checkpoint belum dibuat.
    checkpointButton.disabled = true;
  }

  if (restartButton) {
    restartButton.hidden = !started || completed;
  }
}

// Story Menu menjadi halaman pertama saat website dibuka.
function showStoryMenu() {
  lockScreen.classList.add('is-hidden');
  homeScreen.classList.add('is-hidden');
  appLayer.classList.add('is-hidden');

  storyMenu.classList.remove('is-hidden');

  updateStoryMenu();
}

// Tampilkan Lock Screen sebelum masuk ke Home Screen.
function showLockScreen() {
  storyMenu.classList.add('is-hidden');
  homeScreen.classList.add('is-hidden');
  appLayer.classList.add('is-hidden');

  lockScreen.classList.remove('is-hidden');
}

// Tampilkan Home Screen setelah passcode berhasil.
function showHomeScreen() {
  storyMenu.classList.add('is-hidden');
  lockScreen.classList.add('is-hidden');
  appLayer.classList.add('is-hidden');

  homeScreen.classList.remove('is-hidden');

  // Beri tahu Notification Manager bahwa Home Screen sudah tampil.
  window.dispatchEvent(
    new CustomEvent('interlude:home-ready')
  );
}

// ==========================================
// 4. MEMBUAT TOMBOL APLIKASI
// ==========================================

function createAppButton(app) {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'app-icon-button';
  button.dataset.app = app.id;

  button.setAttribute('aria-label', `Open ${app.name}`);

  button.innerHTML = `
    <span class="app-icon ${app.color}">
      ${iconSvg(app.glyph)}
    </span>

    <span class="app-label">
      ${app.name}
    </span>
  `;

  return button;
}

// ==========================================
// 5. MENAMPILKAN IKON DI HOME SCREEN
// ==========================================

function renderHomeIcons() {
  const grid = document.querySelector('#app-grid');
  const dock = document.querySelector('#dock');

  if (!grid || !dock) {
    console.error(
      'Elemen grid atau dock Home Screen tidak ditemukan.'
    );

    return;
  }

  // Bersihkan ikon lama agar tidak terduplikasi.
  grid.replaceChildren();
  dock.replaceChildren();

  APPS.forEach((app) => {
    const button = createAppButton(app);

    if (app.dock) {
      dock.append(button);
    } else {
      grid.append(button);
    }
  });
}

// ==========================================
// 6. MEMBERSIHKAN APLIKASI AKTIF
// ==========================================

function cleanupActiveApp() {
  if (typeof cleanupCurrentApp === 'function') {
    try {
      cleanupCurrentApp();
    } catch (error) {
      console.error(
        'Gagal membersihkan aplikasi:',
        error
      );
    }
  }

  cleanupCurrentApp = null;
}

// ==========================================
// 7. MENUTUP APLIKASI
// ==========================================

function closeApp() {
  // Batalkan hasil import yang masih berjalan.
  appLoadToken++;

  cleanupActiveApp();
  currentApp = null;

  appLayer.classList.add('is-hidden');
  homeScreen.classList.remove('is-hidden');

  appSurface.replaceChildren();
  appSurface.scrollTop = 0;

  // Perbarui notifikasi saat kembali ke Home Screen.
  window.dispatchEvent(
    new CustomEvent('interlude:home-ready')
  );
}

// ==========================================
// 8. MEMBUKA APLIKASI
// ==========================================

async function openApp(appId) {
  const app = APPS.find((item) => item.id === appId);

  if (!app) {
    console.warn(
      `Aplikasi dengan ID "${appId}" tidak ditemukan.`
    );

    return;
  }

  cleanupActiveApp();

  const loadToken = ++appLoadToken;
  currentApp = app.id;

  homeScreen.classList.add('is-hidden');
  storyMenu.classList.add('is-hidden');
  appLayer.classList.remove('is-hidden');

  // Sembunyikan notifikasi ketika aplikasi dibuka.
  window.dispatchEvent(
    new CustomEvent('interlude:app-opened')
  );

  appSurface.scrollTop = 0;

  // Tampilkan loading selama modul aplikasi dimuat.
  appSurface.innerHTML = `
    <div class="generic-app-screen">
      <p>Loading ${app.name}...</p>
    </div>
  `;

  try {
    // Muat modul aplikasi hanya ketika diperlukan.
    const { renderApp } = await import('./apps/app-view.js');

    // Abaikan hasil jika pengguna sudah berpindah aplikasi.
    if (loadToken !== appLoadToken) return;

    if (typeof renderApp !== 'function') {
      throw new TypeError(
        'renderApp tidak ditemukan.'
      );
    }

    appSurface.replaceChildren();

    const cleanup = renderApp(
      app,
      appSurface,
      closeApp
    );

    cleanupCurrentApp =
      typeof cleanup === 'function' ? cleanup : null;

  } catch (error) {
    console.error(
      `Gagal membuka aplikasi ${app.name}:`,
      error
    );

    // Jangan tampilkan error dari aplikasi yang sudah ditinggalkan.
    if (loadToken !== appLoadToken) return;

    appSurface.innerHTML = `
      <div class="generic-app-screen">
        <h2>Aplikasi tidak dapat dibuka</h2>

        <p>
          Terjadi kesalahan saat memuat ${app.name}.
        </p>

        <p>
          Silakan periksa Console untuk detail error.
        </p>
      </div>
    `;
  }
}

// ==========================================
// 9. MEMBUKA APLIKASI DARI NOTIFIKASI
// ==========================================

function handleNotificationOpen({ update } = {}) {
  if (!update || !update.appId) return;

  openApp(update.appId);
}

// ==========================================
// 10. MENANGANI PILIHAN STORY MENU
// ==========================================

function handleStoryMenuAction(event) {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const button = target.closest('[data-story-action]');

  if (!button || button.disabled) return;

  const action = button.dataset.storyAction;

  // NEW STORY / REPLAY STORY
  if (action === 'new') {
    if (isStoryCompleted()) {
      resetStoryState();
    }

    startStory();
    showLockScreen();

    return;
  }

  // CONTINUE STORY
  if (action === 'continue') {
    // Progres cerita tetap tersimpan.
    // Pembaca tetap melewati Lock Screen.
    showLockScreen();

    return;
  }

  // RESTART STORY
  if (action === 'restart') {
    const confirmed = window.confirm(
      'Restart Story? Your current story progress will be reset.'
    );

    if (!confirmed) return;

    resetStoryState();
    startStory();
    showLockScreen();
  }

  // CHOOSE CHECKPOINT belum diaktifkan.
}

// ==========================================
// 11. EVENT DELEGATION IKON APLIKASI
// ==========================================

function handleAppClick(event) {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const appButton = target.closest('[data-app]');

  if (!appButton) return;

  openApp(appButton.dataset.app);
}

// ==========================================
// 12. TOMBOL HOME
// ==========================================

function handleHomeIndicatorClick() {
  if (!appLayer.classList.contains('is-hidden')) {
    closeApp();
  }
}

// ==========================================
// 13. TOMBOL ESCAPE
// ==========================================

function handleKeydown(event) {
  if (event.key === 'Escape' && currentApp) {
    closeApp();
  }
}

// ==========================================
// 14. SERVICE WORKER
// ==========================================

function registerServiceWorker() {
  if (
    !('serviceWorker' in navigator) ||
    !/^https?:$/.test(location.protocol)
  ) {
    return;
  }

  const register = () => {
    navigator.serviceWorker
      .register('./sw.js')
      .catch((error) => {
        console.warn(
          'Service Worker belum dapat didaftarkan:',
          error
        );
      });
  };

  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register, {
      once: true
    });
  }
}

// ==========================================
// 15. INISIALISASI UTAMA INTERLUDE
// ==========================================

function initApp() {
  // Pastikan semua elemen HTML tersedia.
  if (!validateRequiredElements()) return;

  // ----------------------------------------
  // Pasang event listener utama
  // ----------------------------------------

  storyMenuActions.addEventListener(
    'click',
    handleStoryMenuAction
  );

  document.addEventListener(
    'click',
    handleAppClick
  );

  homeIndicator.addEventListener(
    'click',
    handleHomeIndicatorClick
  );

  window.addEventListener(
    'keydown',
    handleKeydown
  );

  // ----------------------------------------
  // Tampilkan Story Menu terlebih dahulu
  // ----------------------------------------

  showStoryMenu();

  // ----------------------------------------
  // Render ikon aplikasi
  // ----------------------------------------

  try {
    renderHomeIcons();
  } catch (error) {
    console.error(
      'Gagal menampilkan ikon aplikasi:',
      error
    );
  }

  // ----------------------------------------
  // Jalankan Clock
  // ----------------------------------------

  try {
    startClock();
  } catch (error) {
    console.error(
      'Gagal menjalankan Clock:',
      error
    );
  }

  // ----------------------------------------
  // Jalankan Lock Screen
  // ----------------------------------------

  try {
    initLockScreen(showHomeScreen);
  } catch (error) {
    console.error(
      'Gagal menjalankan Lock Screen:',
      error
    );
  }

  // ----------------------------------------
  // Jalankan Story Engine
  // ----------------------------------------

  try {
    initStoryEngine([]);
  } catch (error) {
    console.error(
      'Gagal menjalankan Story Engine:',
      error
    );
  }

  // ----------------------------------------
  // Jalankan Notification Manager
  // ----------------------------------------

  try {
    on(
      'notification:open',
      handleNotificationOpen
    );

    initNotificationManager();
  } catch (error) {
    console.error(
      'Gagal menjalankan Notification Manager:',
      error
    );
  }

  // ----------------------------------------
  // Daftarkan Service Worker
  // ----------------------------------------

  registerServiceWorker();

  console.info(
    'Interlude berhasil memulai inisialisasi.'
  );
}

// ==========================================
// 16. JALANKAN APLIKASI
// ==========================================

initApp();