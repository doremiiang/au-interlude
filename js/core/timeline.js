
import { EPISODES } from '../../data/timeline.js';

import {
  getSelectedEpisode as getSavedEpisode,
  setSelectedEpisode as saveSelectedEpisode
} from './story-state.js';

// Memvalidasi tanggal dengan format YYYY-MM-DD.
function isValidDate(dateString) {
  if (
    typeof dateString !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return false;
  }

  const [year, month, day] = dateString
    .split('-')
    .map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Mengambil seluruh daftar episode.
export function getEpisodes() {
  return EPISODES.map((episode) => ({ ...episode }));
}

// Mengambil episode berdasarkan ID.
export function getEpisode(episodeId) {
  const episode = EPISODES.find(
    (item) => item.id === episodeId
  );

  return episode ? { ...episode } : null;
}

// Mencari episode berdasarkan tanggal cerita.
export function getEpisodeForDate(dateString) {
  if (!isValidDate(dateString)) return null;

  const episode = EPISODES.find((item) => {
    return (
      dateString >= item.startDate &&
      dateString <= item.endDate
    );
  });

  return episode ? { ...episode } : null;
}

// Memeriksa apakah tanggal termasuk dalam episode.
export function isDateInEpisode(dateString, episodeId) {
  const episode = getEpisode(episodeId);

  if (!episode || !isValidDate(dateString)) {
    return false;
  }

  return (
    dateString >= episode.startDate &&
    dateString <= episode.endDate
  );
}

// Mengambil episode yang sedang dipilih pembaca.
export function getSelectedEpisode() {
  const episode = getEpisode(getSavedEpisode());

  return episode || getEpisode(EPISODES[0]?.id);
}

// Mengubah episode pilihan pembaca.
export function selectEpisode(episodeId) {
  if (!getEpisode(episodeId)) {
    return false;
  }

  return saveSelectedEpisode(episodeId);
}

// Mengambil episode sebelum atau sesudah episode tertentu.
export function getAdjacentEpisode(episodeId, direction = 1) {
  const index = EPISODES.findIndex(
    (episode) => episode.id === episodeId
  );

  if (index === -1) return null;

  const nextIndex = index + Math.sign(direction);

  if (nextIndex < 0 || nextIndex >= EPISODES.length) {
    return null;
  }

  return { ...EPISODES[nextIndex] };
}

