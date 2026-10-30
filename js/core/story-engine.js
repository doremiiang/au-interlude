
import { on, emit } from './event-bus.js';

import {
  getCurrentEpisode,
  isDateInEpisode,
  getEpisodeProgress
} from './timeline.js';

import {
  getEventStatus,
  setEventStatus,
  hasInteraction,
  recordInteraction
} from './story-state.js';

let registeredEvents = new Map();
let cleanupListeners = [];

let isRefreshing = false;
let refreshRequested = false;

// Membuat salinan data agar konfigurasi tidak berubah dari luar.
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Memastikan payload trigger berupa object.
function normalizePayload(payload) {
  return (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload)
  )
    ? payload
    : {};
}

// Memeriksa kecocokan payload dengan kondisi trigger.
function matchesPayload(expected = {}, payload = {}) {
  return Object.entries(expected).every(([key, value]) => {
    return payload[key] === value;
  });
}

// Memeriksa apakah seluruh persyaratan sebuah event terpenuhi.
function meetsRequirements(storyEvent) {
  const currentEpisode = getCurrentEpisode();

  if (!currentEpisode) return false;

  // Event hanya berlaku pada episode yang sedang berjalan.
  if (storyEvent.episodeId !== currentEpisode.id) {
    return false;
  }

  // Pastikan checkpoint episode tersebut sudah terbuka.
  const progress = getEpisodeProgress(storyEvent.episodeId);

  if (!progress?.unlocked) {
    return false;
  }

  // Pastikan tanggal event sesuai dengan episode.
  if (
    storyEvent.date &&
    !isDateInEpisode(storyEvent.date, storyEvent.episodeId)
  ) {
    return false;
  }

  const requirements = storyEvent.requires || {};

  const requiredInteractions = Array.isArray(
    requirements.interactions
  )
    ? requirements.interactions
    : [];

  const requiredEvents = Array.isArray(
    requirements.completedEvents
  )
    ? requirements.completedEvents
    : [];

  const interactionsComplete = requiredInteractions.every(
    (interactionId) => hasInteraction(interactionId)
  );

  const eventsComplete = requiredEvents.every(
    (eventId) => getEventStatus(eventId) === 'completed'
  );

  return interactionsComplete && eventsComplete;
}

// Memperbarui status locked dan available.
export function refreshStoryEvents() {
  // Mencegah refresh bersarang akibat perubahan Story State.
  if (isRefreshing) {
    refreshRequested = true;

    return {
      available: [],
      locked: []
    };
  }

  isRefreshing = true;

  const results = {
    available: [],
    locked: []
  };

  try {
    do {
      refreshRequested = false;

      registeredEvents.forEach((storyEvent, eventId) => {
        const currentStatus = getEventStatus(eventId);

        // Event yang sudah dipicu atau selesai tidak diulang.
        if (
          currentStatus === 'triggered' ||
          currentStatus === 'completed'
        ) {
          return;
        }

        const eligible = meetsRequirements(storyEvent);

        if (eligible && currentStatus !== 'available') {
          const updated = setEventStatus(eventId, 'available');

          if (updated) {
            results.available.push(eventId);
          }
        } else if (!eligible && currentStatus !== 'locked') {
          const updated = setEventStatus(eventId, 'locked');

          if (updated) {
            results.locked.push(eventId);
          }
        }
      });
    } while (refreshRequested);
  } finally {
    isRefreshing = false;
  }

  return results;
}

// Menjalankan trigger ketika event aplikasi diterima.
function handleTrigger(storyEvent, payload = {}) {
  const eventId = storyEvent.id;
  const normalizedPayload = normalizePayload(payload);

  // Event harus tersedia terlebih dahulu.
  if (getEventStatus(eventId) !== 'available') {
    return false;
  }

  // Periksa kembali seluruh persyaratan.
  if (!meetsRequirements(storyEvent)) {
    refreshStoryEvents();

    return false;
  }

  const trigger = storyEvent.trigger || {};

  // Periksa kondisi payload.
  if (!matchesPayload(trigger.match, normalizedPayload)) {
    return false;
  }

  // Ubah status sebelum mengirim hasil trigger.
  const updated = setEventStatus(eventId, 'triggered');

  if (!updated) return false;

  emit('story:event:triggered', {
    eventId,
    storyEvent: clone(storyEvent),
    triggerPayload: clone(normalizedPayload)
  });

  return true;
}

// Mencatat interaksi pembaca.
export function recordStoryInteraction(interaction = {}) {
  const updated = recordInteraction(interaction);

  if (!updated) return false;

  emit('story:interaction:recorded', {
    interaction: clone(interaction)
  });

  // Story State juga memicu refresh melalui Event Bus.
  refreshStoryEvents();

  return true;
}

// Menginisialisasi Story Engine.
export function initStoryEngine(events = []) {
  // Bersihkan inisialisasi sebelumnya.
  cleanupStoryEngine();

  registeredEvents = new Map();

  if (!Array.isArray(events)) {
    console.error(
      'Daftar Story Events harus berupa array.'
    );

    return () => cleanupStoryEngine();
  }

  // Mendaftarkan konfigurasi event.
  events.forEach((storyEvent) => {
    if (
      !storyEvent ||
      typeof storyEvent.id !== 'string' ||
      !storyEvent.id.trim() ||
      typeof storyEvent.episodeId !== 'string' ||
      typeof storyEvent.trigger?.event !== 'string' ||
      !storyEvent.trigger.event.trim()
    ) {
      console.warn(
        'Konfigurasi Story Event tidak valid:',
        storyEvent
      );

      return;
    }

    if (registeredEvents.has(storyEvent.id)) {
      console.warn(
        `Story Event duplikat: ${storyEvent.id}`
      );

      return;
    }

    registeredEvents.set(
      storyEvent.id,
      clone(storyEvent)
    );
  });

  // Mendengarkan perubahan progres pembaca.
  cleanupListeners.push(
    on('story-state:changed', refreshStoryEvents)
  );

  cleanupListeners.push(
    on('story-state:reset', refreshStoryEvents)
  );

  // Satu listener untuk setiap jenis trigger.
  const triggerNames = new Set(
    [...registeredEvents.values()].map(
      (storyEvent) => storyEvent.trigger.event
    )
  );

  triggerNames.forEach((triggerName) => {
    cleanupListeners.push(
      on(triggerName, (payload) => {
        registeredEvents.forEach((storyEvent) => {
          if (storyEvent.trigger.event === triggerName) {
            handleTrigger(storyEvent, payload);
          }
        });
      })
    );
  });

  // Periksa status seluruh event saat pertama kali aktif.
  refreshStoryEvents();

  console.info(
    `Story Engine aktif: ${registeredEvents.size} event terdaftar.`
  );

  return () => cleanupStoryEngine();
}

// Menyelesaikan event yang sudah dipicu.
export function completeStoryEvent(eventId) {
  if (!registeredEvents.has(eventId)) {
    return false;
  }

  if (getEventStatus(eventId) !== 'triggered') {
    return false;
  }

  const updated = setEventStatus(eventId, 'completed');

  if (!updated) return false;

  emit('story:event:completed', {
    eventId,
    storyEvent: clone(registeredEvents.get(eventId))
  });

  return true;
}

// Mengambil satu konfigurasi event.
export function getStoryEvent(eventId) {
  const storyEvent = registeredEvents.get(eventId);

  return storyEvent ? clone(storyEvent) : null;
}

// Mengambil seluruh konfigurasi event.
export function getStoryEvents() {
  return [...registeredEvents.values()].map(clone);
}

// Membersihkan seluruh listener Story Engine.
export function cleanupStoryEngine() {
  cleanupListeners.forEach((cleanup) => cleanup());

  cleanupListeners = [];
  registeredEvents.clear();

  isRefreshing = false;
  refreshRequested = false;
}
