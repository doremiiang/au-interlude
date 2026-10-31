// SVG inline agar ikon tetap tajam tanpa library eksternal.
const paths = {
  message: '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z"/><path d="M7.5 11.5h.01M12 11.5h.01M16.5 11.5h.01"/>',
  whatsapp: '<path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4Z"/><path d="M8.5 8.2c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4 0 .7.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .4-.2 1.1-.7 1.5-.5.5-1.2.7-1.9.6-1.1-.2-2.5-.8-3.9-2.1-1.3-1.2-2.1-2.7-2.3-3.7-.2-.8.1-1.5.5-2.1Z"/>',
  photos: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18"/>',
  camera: '<path d="M4 7h3l1.5-2h7L17 7h3v12H4z"/><circle cx="12" cy="13" r="4"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.8h.01"/>',
  x: '<path d="M5 4h3.9l10.1 16h-3.9L5 4Z"/><path d="m19 4-6.3 7.1M5 20l6.6-7.4"/>',
  music: '<path d="M10 18V5l10-2v13"/><circle cx="7" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  notes: '<path d="M6 4h12v16H6zM9 9h6M9 13h6M9 17h4"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4M16.5 3v4M3.5 9h17M8 13h2M14 13h2M8 17h2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.1 1.9-2 3.4-2.2-.5a8 8 0 0 1-1.7 1l-.4 2.1h-4l-.4-2.1a8 8 0 0 1-1.7-1l-2.2.5-2-3.4 1.1-1.9a8 8 0 0 1 0-2l-1.1-1.9 2-3.4 2.2.5a8 8 0 0 1 1.7-1L10.3 5h4l.4 2.1a8 8 0 0 1 1.7 1l2.2-.5 2 3.4-1.1 1.9a8 8 0 0 1-.1 2.1Z" transform="translate(-1 -2) scale(1.08)"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 5-4.8 2 2.2-5z"/>',
  phone: '<path d="M7 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-2l-4.5-2-2 2a14 14 0 0 1-7.5-7.5l2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>'
};

export function iconSvg(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || paths.message}</svg>`;
}
