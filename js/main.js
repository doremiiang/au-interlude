
import { APPS } from '../data/apps.js';
import { iconSvg } from './core/icons.js';
import { startClock } from './core/clock.js';
import { initLockScreen } from './core/lockscreen.js';

const homeScreen = document.querySelector('#home-screen');
const appLayer = document.querySelector('#app-layer');
const appSurface = document.querySelector('#app-surface');
const homeIndicator = document.querySelector('#home-indicator');

let cleanupCurrentApp = null;
let currentApp = null;

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
    console.error('Home Screen elements tidak ditemukan.');
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

  if (!app) return;

  cleanupActiveApp();

  const loadToken = ++appLoadToken;

  currentApp = app.id;

  homeScreen.classList.add('is-hidden');
  appLayer.classList.remove('is-hidden');

  appSurface.scrollTop = 0;

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
// Inisialisasi Home Screen.
renderHomeIcons();

// Inisialisasi jam.
startClock();

// Inisialisasi Lock Screen.
initLockScreen(() => {
  homeScreen.classList.remove('is-hidden');
});

// Event delegation untuk semua ikon aplikasi.
document.addEventListener('click', (event) => {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const appButton = target.closest('[data-app]');

  if (!appButton) return;

  openApp(appButton.dataset.app);
});

// Tombol Home untuk menutup aplikasi.
homeIndicator.addEventListener('click', () => {
  if (!appLayer.classList.contains('is-hidden')) {
    closeApp();
  }
});

// Tombol Escape untuk kembali ke Home.
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && currentApp) {
    closeApp();
  }
});

// Registrasi Service Worker.
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
