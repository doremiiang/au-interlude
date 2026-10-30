
const listeners = new Map();

export function on(eventName, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Event callback harus berupa function.');
  }

  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }

  listeners.get(eventName).add(callback);

  // Mengembalikan fungsi untuk berhenti mendengarkan event.
  return () => off(eventName, callback);
}

export function off(eventName, callback) {
  const eventListeners = listeners.get(eventName);

  if (!eventListeners) return;

  eventListeners.delete(callback);

  if (eventListeners.size === 0) {
    listeners.delete(eventName);
  }
}

export function emit(eventName, payload = {}) {
  const eventListeners = listeners.get(eventName);

  if (!eventListeners) return;

  [...eventListeners].forEach((callback) => {
    try {
      callback(payload);
    } catch (error) {
      console.error(
        `Error pada event "${eventName}":`,
        error
      );
    }
  });
}

export function once(eventName, callback) {
  const unsubscribe = on(eventName, (payload) => {
    unsubscribe();
    callback(payload);
  });

  return unsubscribe;
}

export function clear(eventName) {
  if (eventName) {
    listeners.delete(eventName);
    return;
  }

  listeners.clear();
}

