
import { CONFIG } from '../../data/config.js';

const timeFormatter = new Intl.DateTimeFormat(CONFIG.locale, {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

const dateFormatter = new Intl.DateTimeFormat(CONFIG.locale, {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

function formatTime(date) {
  const parts = timeFormatter.formatToParts(date);

  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';

  return `${hour}:${minute}`;
}

export function startClock() {
  const lockClock = document.querySelector('#lock-clock');
  const statusTime = document.querySelector('#status-time');
  const lockDate = document.querySelector('#lock-date');
  const homeDate = document.querySelector('#home-date');
  const calendarDay = document.querySelector('#calendar-day');

  function update() {
    const now = new Date();

    const time = formatTime(now);
    const date = dateFormatter.format(now);

    // Lock Screen: 14:30
    if (lockClock) {
      lockClock.textContent = time;
    }

    if (lockDate) {
      lockDate.textContent = date;
    }

    // Status Bar: 14.30
    if (statusTime) {
      statusTime.textContent = time.replace(':', '.');
    }

    // Home Screen.
    if (homeDate) {
      homeDate.textContent = date.toUpperCase();
    }

    if (calendarDay) {
      calendarDay.textContent = String(now.getDate());
    }

    // Tampilkan jam setelah nilainya sudah diperbarui.
    document.body.classList.remove('clock-pending');
  }

  update();

  const intervalId = window.setInterval(update, 1000);

  return function cleanupClock() {
    window.clearInterval(intervalId);
  };
}
