import { CONFIG } from '../../data/config.js';

const formatTime = (date, options) => new Intl.DateTimeFormat(CONFIG.locale, options).format(date);

export function startClock() {
  const update = () => {
    const now = new Date();
    const time = formatTime(now, { hour: '2-digit', minute: '2-digit', hour12: false });
    const date = formatTime(now, { weekday: 'long', day: 'numeric', month: 'long' });
    const homeDate = formatTime(now, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
    document.querySelector('#lock-clock').textContent = time;
    document.querySelector('#status-time').textContent = time.replace(':', '.');
    document.querySelector('#lock-date').textContent = date;
    document.querySelector('#home-date').textContent = homeDate;
    document.querySelector('#calendar-day').textContent = String(now.getDate());
  };
  update();
  window.setInterval(update, 1000);
}
