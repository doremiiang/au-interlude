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

// PATCH: Cache elemen-elemen utama agar mudah digunakan dan divalidasi.
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

// PATCH: Pastikan elemen penting tersedia sebelum inisialisasi.
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

// Memperbarui tombol berdasarkan progres cerita.
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
    // PATCH: Pemilihan checkpoint menunggu UI selector dibuat.
    checkpointButton.disabled = true;
  }

  if (restartButton) {
    restartButton.hidden = !started || completed;
  }
}

// PATCH: Menampilkan Story Menu sebagai halaman pertama saat website dibuka.
function showStoryMenu() {
  lockScreen.classList.add('is-hidden');
  homeScreen.classList.add('is-hidden');
  appLayer.classList.add('is-hidden');
  storyMenu.classList.remove('is-hidden');

  updateStoryMenu();
}

// PATCH: Masuk ke Lock Screen setelah pembaca memilih cerita.

function showHomeScreen() {
  storyMenu.classList.add('is-hidden');
  appLayer.classList.add('is-hidden');
  homeScreen.classList.remove('is-hidden');

  // Memberi tahu Notification Manager bahwa Home Screen siap.
  window.dispatchEvent(
    new CustomEvent('interlude:home-ready')
  );
}

// Menampilkan Home Screen setelah passcode berhasil.
function showHomeScreen() {
  storyMenu.classList.add('is-hidden');
  lockScreen.classList.add('is-hidden');
  appLayer.classList.add('is-hidden');
  homeScreen.classList.remove('is-hidden');

  // PATCH: Memberi tahu Notification Manager bahwa Home Screen siap.
  window.dispatchEvent(
    new CustomEvent('interlude:home-ready', {
      detail: { notificationCenter }
    })
  );
}

// Membuat tombol aplikasi.
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
    <span class="app-label">${app.name}</span>
  `;

  return button;
}

// Menampilkan ikon aplikasi pada Home Screen.
function renderHomeIcons() {
  const grid = document.querySelector('#app-grid');
  const dock = document.querySelector('#dock');

  if (!grid || !dock) {
    console.error('Elemen grid atau dock Home Screen tidak ditemukan.');
    return;
  }

  // Bersihkan ikon sebelumnya agar tidak terduplikasi.
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

// Membersihkan aplikasi yang sedang terbuka.
function cleanupActiveApp() {
  if (typeof cleanupCurrentApp === 'function') {
    try {
      cleanupCurrentApp();
    } catch (error) {
      console.error('Gagal membersihkan aplikasi:', error);
    }
  }

  cleanupCurrentApp = null;
}

// Kembali ke Home Screen.
function closeApp() {
  // PATCH: Batalkan hasil import yang masih berjalan.
  appLoadToken++;

  cleanupActiveApp();
  currentApp = null;

  appLayer.classList.add('is-hidden');
  homeScreen.classList.remove('is-hidden');

  appSurface.replaceChildren();
  appSurface.scrollTop = 0;
}

// Membuka aplikasi berdasarkan ID.
async function openApp(appId) {
  const app = APPS.find((item) => item.id === appId);

  if (!app) {
    console.warn(`Aplikasi dengan ID "${appId}" tidak ditemukan.`);
    return;
  }

  cleanupActiveApp();

  const loadToken = ++appLoadToken;
  currentApp = app.id;

  homeScreen.classList.add('is-hidden');
  storyMenu.classList.add('is-hidden');
  appLayer.classList.remove('is-hidden');

  appSurface.scrollTop = 0;

  // PATCH: Tampilkan loading selama modul aplikasi dimuat.
  appSurface.innerHTML = `
    <div class="generic-app-screen">
      <p>Loading ${app.name}...</p>
    </div>
  `;

  try {
    // Muat modul aplikasi hanya saat diperlukan.
    const { renderApp } = await import('./apps/app-view.js');

    // Abaikan hasil jika pengguna sudah berpindah aplikasi.
    if (loadToken !== appLoadToken) return;

    if (typeof renderApp !== 'function') {
      throw new TypeError('renderApp tidak ditemukan.');
    }

    appSurface.replaceChildren();

    const cleanup = renderApp(app, appSurface, closeApp);

    cleanupCurrentApp =
      typeof cleanup === 'function' ? cleanup : null;
  } catch (error) {
    // PATCH: Tampilkan pesan kegagalan hanya jika pemuatan masih relevan.
    console.error(`Gagal membuka aplikasi ${app.name}:`, error);

    if (loadToken !== appLoadToken) return;

    appSurface.innerHTML = `
      <div class="generic-app-screen">
        <h2>Aplikasi tidak dapat dibuka</h2>
        <p>Terjadi kesalahan saat memuat ${app.name}.</p>
        <p>Silakan periksa Console untuk detail error.</p>
      </div>
    `;
  }
}

// Menangani pilihan pada Story Menu.
function handleStoryMenuAction(event) {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const button = target.closest('[data-story-action]');

  if (!button || button.disabled) return;

  const action = button.dataset.storyAction;

  if (action === 'new') {
    // PATCH: Replay dari awal hanya jika cerita sebelumnya sudah selesai.
    if (isStoryCompleted()) {
      resetStoryState();
    }

    startStory();
    showLockScreen();
    return;
  }

  if (action === 'continue') {
    // PATCH: Pembaca tetap melewati Lock Screen sebelum masuk ke HP.
    showLockScreen();
    return;
  }

  if (action === 'restart') {
    const confirmed = window.confirm(
      'Restart Story? Your current story progress will be reset.'
    );

    if (!confirmed) return;

    resetStoryState();
    startStory();
    showLockScreen();
  }
}

// Event delegation untuk semua ikon aplikasi.
function handleAppClick(event) {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const appButton = target.closest('[data-app]');

  if (!appButton) return;

  openApp(appButton.dataset.app);
}

// Tombol Home untuk menutup aplikasi.
function handleHomeIndicatorClick() {
  if (!appLayer.classList.contains('is-hidden')) {
    closeApp();
  }
}

// Tombol Escape untuk kembali ke Home.
function handleKeydown(event) {
  if (event.key === 'Escape' && currentApp) {
    closeApp();
  }
}

// Registrasi Service Worker.
function registerServiceWorker() {
  if (
    'serviceWorker' in navigator &&
    /^https?:$/.test(location.protocol)
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .catch((error) => {
          console.warn(
            'Service Worker belum dapat didaftarkan:',
            error
          );
        });
    });
  }
}

// PATCH: Jalankan aplikasi hanya setelah elemen HTML utama tervalidasi.
function initApp() {
  if (!validateRequiredElements()) return;

  renderHomeIcons();
  startClock();

  // Story Engine masih menggunakan daftar event kosong untuk tahap ini.
  initStoryEngine([]);

  // PATCH: Passcode berhasil akan membawa pembaca ke Home Screen.
  initLockScreen(showHomeScreen);

  storyMenuActions.addEventListener('click', handleStoryMenuAction);
  document.addEventListener('click', handleAppClick);
  homeIndicator.addEventListener('click', handleHomeIndicatorClick);
  window.addEventListener('keydown', handleKeydown);

  registerServiceWorker();

  // PATCH: Tampilkan Story Menu langsung pada kunjungan pertama.
  showStoryMenu();
}

initApp();
