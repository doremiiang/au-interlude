
import { emit } from './event-bus.js';

const STORAGE_KEY = 'interlude-story-state-v1';

const VALID_EVENT_STATUSES = [
  'locked',
  'available',
  'triggered',
  'completed'
];

const DEFAULT_STATE = {
  version: 1,
  selectedEpisode: 'episode-01',
  events: {},
  interactions: [],
  updatedAt: null
};

let state = loadState();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createDefaultState() {
  return clone(DEFAULT_STATE);
}

// Membaca progres dari localStorage.
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return createDefaultState();

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.version !== 1
    ) {
      return createDefaultState();
    }

    return {
      ...createDefaultState(),
      ...parsed,
      events: parsed.events &&
        typeof parsed.events === 'object'
        ? parsed.events
        : {},
      interactions: Array.isArray(parsed.interactions)
        ? parsed.interactions
        : []
    };
  } catch (error) {
    console.warn('Gagal membaca Story State:', error);
    return createDefaultState();
  }
}

// Menyimpan progres.
function saveState() {
  state.updatedAt = new Date().toISOString();

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn('Gagal menyimpan Story State:', error);
  }

  emit('story-state:changed', getState());
}

// Mengambil seluruh progres pembaca.
export function getState() {
  return clone(state);
}

// Mengambil episode yang sedang dipilih.
export function getSelectedEpisode() {
  return state.selectedEpisode;
}

// Mengubah episode aktif.
export function setSelectedEpisode(episodeId) {
  if (
    typeof episodeId !== 'string' ||
    !episodeId.trim()
  ) {
    return false;
  }

  state.selectedEpisode = episodeId;
  saveState();

  return true;
}

// Mengambil status sebuah event.
export function getEventStatus(eventId) {
  return state.events[eventId] || 'locked';
}

// Mengubah status event.
export function setEventStatus(eventId, status) {
  if (
    typeof eventId !== 'string' ||
    !eventId.trim() ||
    !VALID_EVENT_STATUSES.includes(status)
  ) {
    return false;
  }

  state.events[eventId] = status;
  saveState();

  return true;
}

// Memeriksa apakah interaksi pernah dilakukan.
export function hasInteraction(interactionId) {
  return state.interactions.some(
    (item) => item.id === interactionId
  );
}

// Mencatat interaksi pembaca.
export function recordInteraction(interaction) {
  if (
    !interaction ||
    typeof interaction.id !== 'string' ||
    !interaction.id.trim()
  ) {
    return false;
  }

  if (hasInteraction(interaction.id)) {
    return false;
  }

  state.interactions.push({
    id: interaction.id,
    type: interaction.type || 'unknown',
    data: interaction.data ?? null,
    timestamp: new Date().toISOString()
  });

  saveState();

  return true;
}

// Mengambil riwayat interaksi.
export function getInteractions() {
  return clone(state.interactions);
}

// Menghapus seluruh progres pembaca.
export function resetStoryState() {
  state = createDefaultState();

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Gagal menghapus Story State:', error);
  }

  emit('story-state:reset', getState());
}

