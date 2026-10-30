
import { CONFIG } from '../../data/config.js';

const formatTime = (date, options) => {
  return new Intl.DateTimeFormat(CONFIG.locale, options).format(date);
};

export function startClock() {
  const lockClock = document.querySelector('#lock-clock');
  const statusTime = document.querySelector('#status-time');
  const lockDate = document.querySelector('#lock-date');
  const homeDate = document.querySelector('#home-date');
  const calendarDay = document.querySelector('#calendar-day');

  function update() {
    const now = new Date();

    // Format waktu 24 jam.
    const time = formatTime(now, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Format tanggal Indonesia.
    const date = formatTime(now, {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    // Lock Screen.
    if (lockClock) {
      lockClock.textContent = time;
    }

    if (lockDate) {
      lockDate.textContent = date;
    }

    // Status Bar.
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
  }

  // Tampilkan waktu langsung tanpa menunggu interval.
  update();

  // Perbarui waktu setiap detik.
  const intervalId = window.setInterval(update, 1000);

  // Fungsi untuk menghentikan interval jika diperlukan.
  return function cleanupClock() {
    window.clearInterval(intervalId);
  };
}
