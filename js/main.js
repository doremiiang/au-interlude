import { APPS } from '../data/apps.js';
import { iconSvg } from './core/icons.js';
import { startClock } from './core/clock.js';
import { initLockScreen } from './core/lockscreen.js';
import { renderApp } from './apps/app-view.js';

const homeScreen = document.querySelector('#home-screen');
const appLayer = document.querySelector('#app-layer');
const appSurface = document.querySelector('#app-surface');
const homeIndicator = document.querySelector('#home-indicator');
let cleanupCurrentApp = null;
let currentApp = null;

function createAppButton(app) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'app-icon-button';
  button.dataset.app = app.id;
  button.setAttribute('aria-label', `Open ${app.name}`);
  button.innerHTML = `<span class="app-icon ${app.color}">${iconSvg(app.glyph)}</span><span class="app-label">${app.name}</span>`;
  return button;
}

function renderHomeIcons() {
  const grid = document.querySelector('#app-grid');
  const dock = document.querySelector('#dock');
  APPS.filter((app) => !app.dock).forEach((app) => grid.append(createAppButton(app)));
  APPS.filter((app) => app.dock).forEach((app) => dock.append(createAppButton(app)));
}

function closeApp() {
  if (cleanupCurrentApp) cleanupCurrentApp();
  cleanupCurrentApp = null;
  currentApp = null;
  appLayer.classList.add('is-hidden');
  homeScreen.classList.remove('is-hidden');
  appSurface.replaceChildren();
}

function openApp(appId) {
  const app = APPS.find((item) => item.id === appId);
  if (!app) return;
  if (cleanupCurrentApp) cleanupCurrentApp();
  currentApp = app.id;
  homeScreen.classList.add('is-hidden');
  appLayer.classList.remove('is-hidden');
  appSurface.scrollTop = 0;
  cleanupCurrentApp = renderApp(app, appSurface, closeApp);
}

renderHomeIcons();
startClock();
initLockScreen(() => homeScreen.classList.remove('is-hidden'));

document.addEventListener('click', (event) => {
  const appButton = event.target.closest('[data-app]');
  if (appButton) openApp(appButton.dataset.app);
});

homeIndicator.addEventListener('click', () => {
  if (!appLayer.classList.contains('is-hidden')) closeApp();
});

// Escape mengembalikan pengguna ke Home saat aplikasi sedang terbuka.
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && currentApp) closeApp();
});

// Pendaftaran service worker hanya pada origin HTTP/HTTPS.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Service worker belum dapat didaftarkan:', error);
    });
  });
}
