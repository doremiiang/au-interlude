
import { emit } from './event-bus.js';

const STORAGE_KEY = 'interlude-story-state-v1';
const STATE_VERSION = 2;

const EPISODE_IDS = [
  'episode-01',
  'episode-02',
  'episode-03',
  'episode-04'
];

const CHECKPOINTS = [
  { id: 'checkpoint-01', episodeId: 'episode-01' },
  { id: 'checkpoint-02', episodeId: 'episode-02' },
  { id: 'checkpoint-03', episodeId: 'episode-03' },
  { id: 'checkpoint-04', episodeId: 'episode-04' }
];

const VALID_EVENT_STATUSES = [
  'locked',
  'available',
  'triggered',
  'completed'
];

function createDefaultCheckpoints() {
  return Object.fromEntries(
    CHECKPOINTS.map((checkpoint, index) => [
      checkpoint.id,
      {
        episodeId: checkpoint.episodeId,
        unlocked: index === 0,
        completed: false,
        completedAt: null
      }
    ])
  );
}

const DEFAULT_STATE = {
  version: STATE_VERSION,

  storyStarted: false,
  storyCompleted: false,

  currentEpisode: 'episode-01',
  currentCheckpoint: 'checkpoint-01',

  position: {
    episodeId: 'episode-01',
    appId: null,
    contentId: null,
    itemId: null,
    viewState: null,
    updatedAt: null
  },

  checkpoints: createDefaultCheckpoints(),

  events: {},
  interactions: [],

  updatedAt: null
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createDefaultState() {
  return clone(DEFAULT_STATE);
}

function isValidEpisode(episodeId) {
  return EPISODE_IDS.includes(episodeId);
}

function getCheckpointIdForEpisode(episodeId) {
  return CHECKPOINTS.find(
    (item) => item.episodeId === episodeId
  )?.id || 'checkpoint-01';
}

// Migrasi data versi lama agar progres yang sudah ada tidak hilang.
function migrateState(parsed) {
  const defaults = createDefaultState();

  const oldEpisode = isValidEpisode(parsed.selectedEpisode)
    ? parsed.selectedEpisode
    : 'episode-01';

  const currentEpisode = isValidEpisode(parsed.currentEpisode)
    ? parsed.currentEpisode
    : oldEpisode;

  const interactions = Array.isArray(parsed.interactions)
    ? parsed.interactions
    : [];

  const events = parsed.events &&
    typeof parsed.events === 'object'
    ? parsed.events
    : {};

  return {
    ...defaults,
    ...parsed,

    version: STATE_VERSION,

    storyStarted: parsed.storyStarted ??
      (interactions.length > 0 ||
       Object.values(events).some(
         (status) => ['triggered', 'completed'].includes(status)
       ) ||
       currentEpisode !== 'episode-01'),

    storyCompleted: Boolean(parsed.storyCompleted),

    currentEpisode,

    currentCheckpoint: CHECKPOINTS.some(
      (item) => item.id === parsed.currentCheckpoint
    )
      ? parsed.currentCheckpoint
      : getCheckpointIdForEpisode(currentEpisode),

    position: {
      ...defaults.position,
      ...(parsed.position && typeof parsed.position === 'object'
        ? parsed.position
        : {}),
      episodeId: currentEpisode
    },

    checkpoints: {
      ...defaults.checkpoints,
      ...(parsed.checkpoints &&
      typeof parsed.checkpoints === 'object'
        ? parsed.checkpoints
        : {})
    },

    events,
    interactions
  };
}

// Membaca progres dari localStorage.
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return createDefaultState();

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== 'object') {
      return createDefaultState();
    }

    if (parsed.version !== 1 && parsed.version !== STATE_VERSION) {
      return createDefaultState();
    }

    return migrateState(parsed);
  } catch (error) {
    console.warn('Gagal membaca Story State:', error);
    return createDefaultState();
  }
}

let state = loadState();

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

// Status apakah cerita pernah dimulai.
export function hasStartedStory() {
  return state.storyStarted;
}

// Menandai cerita sudah dimulai.
export function startStory() {
  state.storyStarted = true;
  state.storyCompleted = false;
  saveState();
}

// Mengambil episode yang sedang berjalan.
export function getCurrentEpisode() {
  return state.currentEpisode;
}

// Mengubah episode yang sedang berjalan.
export function setCurrentEpisode(episodeId) {
  if (!isValidEpisode(episodeId)) return false;

  state.currentEpisode = episodeId;

  const checkpointId = getCheckpointIdForEpisode(episodeId);

  if (state.checkpoints[checkpointId]?.unlocked) {
    state.currentCheckpoint = checkpointId;
  }

  saveState();
  return true;
}

// Kompatibilitas sementara dengan kode lama.
export function getSelectedEpisode() {
  return getCurrentEpisode();
}

export function setSelectedEpisode(episodeId) {
  return setCurrentEpisode(episodeId);
}

// Mengambil posisi terakhir pembaca.
export function getStoryPosition() {
  return clone(state.position);
}

// Menyimpan posisi terakhir pembaca secara otomatis.
export function saveStoryPosition(position = {}) {
  if (!position || typeof position !== 'object') {
    return false;
  }

  const episodeId = position.episodeId || state.currentEpisode;

  if (!isValidEpisode(episodeId)) return false;

  state.position = {
    ...state.position,
    ...clone(position),
    episodeId,
    updatedAt: new Date().toISOString()
  };

  state.currentEpisode = episodeId;
  state.storyStarted = true;

  const checkpointId = getCheckpointIdForEpisode(episodeId);

  if (state.checkpoints[checkpointId]?.unlocked) {
    state.currentCheckpoint = checkpointId;
  }

  saveState();
  return true;
}

// Mengambil seluruh checkpoint.
export function getCheckpoints() {
  return CHECKPOINTS.map((item) => ({
    ...item,
    ...clone(state.checkpoints[item.id])
  }));
}

// Mengambil satu checkpoint.
export function getCheckpoint(checkpointId) {
  const checkpoint = CHECKPOINTS.find(
    (item) => item.id === checkpointId
  );

  if (!checkpoint) return null;

  return {
    ...checkpoint,
    ...clone(state.checkpoints[checkpointId])
  };
}

// Membuka checkpoint.
export function unlockCheckpoint(checkpointId) {
  const checkpoint = state.checkpoints[checkpointId];

  if (!checkpoint || checkpoint.unlocked) return false;

  checkpoint.unlocked = true;
  saveState();

  return true;
}

// Menandai checkpoint selesai dan membuka checkpoint berikutnya.
export function completeCheckpoint(checkpointId) {
  const checkpoint = state.checkpoints[checkpointId];

  if (!checkpoint || checkpoint.completed) return false;

  checkpoint.unlocked = true;
  checkpoint.completed = true;
  checkpoint.completedAt = new Date().toISOString();

  const currentIndex = CHECKPOINTS.findIndex(
    (item) => item.id === checkpointId
  );

  const nextCheckpoint = CHECKPOINTS[currentIndex + 1];

  if (nextCheckpoint) {
    state.checkpoints[nextCheckpoint.id].unlocked = true;
  } else {
    state.storyCompleted = true;
  }

  saveState();
  return true;
}

// Memeriksa apakah seluruh cerita sudah selesai.
export function isStoryCompleted() {
  return state.storyCompleted;
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

  if (hasInteraction(interaction.id)) return false;

  state.interactions.push({
    id: interaction.id,
    type: interaction.type || 'unknown',
    data: interaction.data ?? null,
    episodeId: interaction.episodeId || state.currentEpisode,
    timestamp: new Date().toISOString()
  });

  state.storyStarted = true;
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
