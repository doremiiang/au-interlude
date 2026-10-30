
import { EPISODES } from '../../data/timeline.js';

import {
  getCurrentEpisode as getSavedCurrentEpisode,
  setCurrentEpisode as saveCurrentEpisode,
  getCheckpoint
} from './story-state.js';

// Memvalidasi format tanggal YYYY-MM-DD.
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

  const episode = EPISODES.find((item) => (
    dateString >= item.startDate &&
    dateString <= item.endDate
  ));

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

// Mengambil episode yang sedang berjalan.
export function getCurrentEpisode() {
  const episodeId = getSavedCurrentEpisode();

  return (
    getEpisode(episodeId) ||
    getEpisode(EPISODES[0]?.id)
  );
}

// Mengubah episode aktif.
// Hanya episode dengan checkpoint terbuka yang bisa dipilih.
export function setCurrentEpisode(episodeId) {
  const episode = getEpisode(episodeId);

  if (!episode) return false;

  const checkpoint = getCheckpoint(
    `checkpoint-${String(episode.number).padStart(2, '0')}`
  );

  if (!checkpoint?.unlocked) {
    return false;
  }

  return saveCurrentEpisode(episodeId);
}

// Mengambil episode yang sudah terbuka.
export function getUnlockedEpisodes() {
  return EPISODES.filter((episode) => {
    const checkpoint = getCheckpoint(
      `checkpoint-${String(episode.number).padStart(2, '0')}`
    );

    return Boolean(checkpoint?.unlocked);
  }).map((episode) => ({ ...episode }));
}

// Mengambil status progres sebuah episode.
export function getEpisodeProgress(episodeId) {
  const episode = getEpisode(episodeId);

  if (!episode) return null;

  const checkpointId =
    `checkpoint-${String(episode.number).padStart(2, '0')}`;

  const checkpoint = getCheckpoint(checkpointId);

  return {
    episodeId,
    checkpointId,
    unlocked: Boolean(checkpoint?.unlocked),
    completed: Boolean(checkpoint?.completed),
    completedAt: checkpoint?.completedAt ?? null
  };
}

// Kompatibilitas sementara dengan Story Engine versi lama.
// Fungsi ini mengembalikan objek episode, bukan ID.
export function getSelectedEpisode() {
  return getCurrentEpisode();
}

// Kompatibilitas sementara dengan kode lama.
export function selectEpisode(episodeId) {
  return setCurrentEpisode(episodeId);
}

// Mengambil episode sebelum atau sesudah episode tertentu.
export function getAdjacentEpisode(episodeId, direction = 1) {
  const index = EPISODES.findIndex(
    (episode) => episode.id === episodeId
  );

  if (index === -1 || !Number.isFinite(direction)) {
    return null;
  }

  const nextIndex = index + Math.sign(direction);

  if (
    nextIndex < 0 ||
    nextIndex >= EPISODES.length
  ) {
    return null;
  }

  return { ...EPISODES[nextIndex] };
}

// Mengambil episode berikutnya yang sudah terbuka.
export function getAdjacentUnlockedEpisode(
  episodeId,
  direction = 1
) {
  const adjacent = getAdjacentEpisode(episodeId, direction);

  if (!adjacent) return null;

  const checkpoint = getEpisodeProgress(adjacent.id);

  return checkpoint?.unlocked ? adjacent : null;
}
