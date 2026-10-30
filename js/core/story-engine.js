
import { on, emit } from './event-bus.js';

import {
  getSelectedEpisode,
  isDateInEpisode
} from './timeline.js';

import {
  getEventStatus,
  setEventStatus,
  hasInteraction
} from './story-state.js';

let registeredEvents = new Map();
let cleanupListeners = [];

// Membuat salinan data agar konfigurasi tidak berubah dari luar.
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Memeriksa kecocokan payload dengan kondisi trigger.
function matchesPayload(expected = {}, payload = {}) {
  return Object.entries(expected).every(([key, value]) => {
    return payload[key] === value;
  });
}

// Memeriksa seluruh persyaratan sebuah event.
function meetsRequirements(storyEvent) {
  const selectedEpisode = getSelectedEpisode();

  if (!selectedEpisode) return false;

  if (storyEvent.episodeId !== selectedEpisode.id) {
    return false;
  }

  if (
    storyEvent.date &&
    !isDateInEpisode(storyEvent.date, storyEvent.episodeId)
  ) {
    return false;
  }

  const requirements = storyEvent.requires || {};

  const requiredInteractions = requirements.interactions || [];

  const requiredEvents = requirements.completedEvents || [];

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
  const results = {
    available: [],
    locked: []
  };

  registeredEvents.forEach((storyEvent, eventId) => {
    const currentStatus = getEventStatus(eventId);

    // Event yang sudah berjalan tidak dikunci kembali.
    if (
      currentStatus === 'triggered' ||
      currentStatus === 'completed'
    ) {
      return;
    }

    const eligible = meetsRequirements(storyEvent);

    if (eligible && currentStatus === 'locked') {
      setEventStatus(eventId, 'available');
      results.available.push(eventId);
    } else if (!eligible && currentStatus === 'available') {
      setEventStatus(eventId, 'locked');
      results.locked.push(eventId);
    }
  });

  return results;
}

// Menjalankan trigger ketika event aplikasi diterima.
function handleTrigger(storyEvent, payload = {}) {
  const eventId = storyEvent.id;

  // Pastikan event memang sudah tersedia.
  if (getEventStatus(eventId) !== 'available') {
    return false;
  }

  // Pastikan syarat masih terpenuhi.
  if (!meetsRequirements(storyEvent)) {
    refreshStoryEvents();
    return false;
  }

  const trigger = storyEvent.trigger || {};

  if (!matchesPayload(trigger.match, payload)) {
    return false;
  }

  // Ubah status sebelum mengirim hasil trigger.
  const updated = setEventStatus(eventId, 'triggered');

  if (!updated) return false;

  emit('story:event:triggered', {
    eventId,
    storyEvent: clone(storyEvent),
    triggerPayload: clone(payload)
  });

  return true;
}

// Menginisialisasi Story Engine.
export function initStoryEngine(events = []) {
  // Bersihkan listener dari inisialisasi sebelumnya.
  cleanupStoryEngine();

  registeredEvents = new Map();

  if (!Array.isArray(events)) {
    console.error('Daftar Story Events harus berupa array.');
    return () => cleanupStoryEngine();
  }

  // Mendaftarkan konfigurasi event.
  events.forEach((storyEvent) => {
    if (
      !storyEvent ||
      typeof storyEvent.id !== 'string' ||
      typeof storyEvent.episodeId !== 'string' ||
      typeof storyEvent.trigger?.event !== 'string'
    ) {
      console.warn('Konfigurasi Story Event tidak valid:', storyEvent);
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
}

