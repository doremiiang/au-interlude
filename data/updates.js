
/*
 * INTERLUDE — UPDATE REGISTRY
 *
 * Daftar seluruh konten baru yang dapat memunculkan
 * notifikasi di iPhone Shaqil.
 *
 * Setiap update memiliki:
 * - id            : ID unik update.
 * - storyEventId  : ID event dari data/story-events.js.
 * - appId         : ID aplikasi tujuan.
 * - contentId     : ID konten yang akan dibuka.
 * - title         : Judul notifikasi.
 * - body          : Isi notifikasi.
 * - timeLabel     : Waktu yang tampil di notifikasi.
 *
 * Update hanya tersedia setelah Story Event terkait
 * berhasil dipicu oleh Story Engine.
 */

// PATCH: Daftar update cerita Interlude.
export const UPDATES = [];
