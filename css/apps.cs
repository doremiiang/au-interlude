.app-layer {
  position: absolute;
  z-index: 20;
  inset: 0;
  padding-top: 47px;
  background: #17151b;
  color: #fff;
  animation: appOpen .28s cubic-bezier(.2,.8,.2,1) both;
}
.app-surface {
  --app-bg: #f7f5f8;
  --app-card: #fff;
  --app-card-soft: #f0edf2;
  --app-ink: #25212a;
  --app-muted: #89828d;
  --app-line: rgba(35, 29, 40, .09);
  width: 100%;
  height: 100%;
  overflow: auto;
  overscroll-behavior: contain;
  background: var(--app-bg);
  color: var(--app-ink);
  padding-bottom: 34px;
  scrollbar-width: none;
}
.app-surface::-webkit-scrollbar { display: none; }
.app-layer[data-theme="dark"] { background: #17151b; color: #f8f4f8; }
.app-surface[data-theme="dark"] {
  color-scheme: dark;
  --app-bg: #17151b;
  --app-card: #24212a;
  --app-card-soft: #302b36;
  --app-ink: #f8f4f8;
  --app-muted: #aaa2b0;
  --app-line: rgba(255,255,255,.1);
}
.app-header {
  min-height: 53px;
  display: grid;
  grid-template-columns: minmax(58px, 1fr) auto minmax(58px, 1fr);
  align-items: center;
  gap: 8px;
  padding: 0 17px;
  border-bottom: 1px solid var(--app-line);
  background: color-mix(in srgb, var(--app-bg) 86%, transparent);
  position: sticky;
  top: 0;
  z-index: 5;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.app-header h2 { margin: 0; font-size: 15px; font-weight: 750; text-align: center; white-space: nowrap; }
.app-back { justify-self: start; border: 0; padding: 7px 0; background: transparent; color: #a45e83; font-size: 14px; cursor: pointer; white-space: nowrap; }
.app-back span { font-size: 12px; }
.app-header-action { justify-self: end; min-width: 24px; color: #a45e83; text-align: right; }
.app-header-symbol { font-size: 20px; line-height: 1; }
.app-page-heading { padding: 21px 20px 13px; }
.app-page-heading h3, .calendar-month-heading h3 { margin: 3px 0 0; color: var(--app-ink); font-size: 27px; letter-spacing: -.04em; font-weight: 800; }
.app-eyebrow { margin: 0; color: var(--app-muted); font-size: 8px; letter-spacing: .17em; font-weight: 800; }
.app-page-heading > span { display: block; margin-top: 5px; color: var(--app-muted); font-size: 10px; }
.app-empty-state { min-height: 230px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; text-align: center; color: var(--app-muted); }
.app-empty-icon { width: 56px; height: 56px; display: grid; place-items: center; margin-bottom: 14px; border-radius: 18px; background: var(--app-card-soft); color: #a36d8b; }
.app-empty-icon svg { width: 25px; height: 25px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.app-empty-state h3 { margin: 0 0 6px; color: var(--app-ink); font-size: 14px; }
.app-empty-state p { max-width: 235px; margin: 0; font-size: 10px; line-height: 1.6; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* Messages */
.messages-screen { min-height: calc(100% - 53px); }
.app-search { height: 36px; display: flex; align-items: center; gap: 8px; margin: 0 18px 12px; padding: 0 11px; border-radius: 10px; background: var(--app-card-soft); color: var(--app-muted); }
.app-search > span { font-size: 19px; line-height: 1; }
.app-search input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--app-ink); font: inherit; font-size: 11px; }
.app-search input::placeholder { color: var(--app-muted); }
.message-contact-list { padding: 0 17px; }
.message-contact-row { width: 100%; min-height: 67px; display: flex; align-items: center; gap: 11px; padding: 9px 2px; border: 0; border-bottom: 1px solid var(--app-line); background: transparent; color: var(--app-ink); text-align: left; cursor: pointer; }
.message-avatar { width: 43px; height: 43px; flex: 0 0 43px; display: grid; place-items: center; border-radius: 50%; background: linear-gradient(145deg,#eddae7,#d8c6df); color: #805a78; font-size: 12px; font-weight: 800; }
.message-contact-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 5px; }
.message-contact-copy strong { overflow: hidden; color: var(--app-ink); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.message-contact-copy span { overflow: hidden; color: var(--app-muted); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.message-contact-meta { color: var(--app-muted); font-size: 9px; }
.message-thread { min-height: calc(100% - 53px); display: flex; flex-direction: column; }
.thread-profile { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 20px 14px 12px; border-bottom: 1px solid var(--app-line); }
.message-avatar-large { width: 54px; height: 54px; flex-basis: 54px; margin-bottom: 3px; font-size: 14px; }
.thread-profile strong { color: var(--app-ink); font-size: 12px; }
.thread-profile > span:last-child { color: var(--app-muted); font-size: 9px; }
.thread-history { flex: 1; min-height: 250px; display: flex; flex-direction: column; justify-content: flex-end; padding: 12px 14px 18px; }
.thread-history .app-empty-state { min-height: 220px; }
.message-bubbles { display: flex; flex-direction: column; gap: 8px; }
.message-bubble { max-width: 82%; align-self: flex-end; padding: 9px 12px 6px; border-radius: 16px 16px 4px 16px; background: #a66f91; color: white; overflow-wrap: anywhere; }
.message-bubble p { margin: 0; font-size: 11px; line-height: 1.5; white-space: pre-wrap; }
.message-bubble time { display: block; margin-top: 4px; color: rgba(255,255,255,.72); font-size: 8px; text-align: right; }
.message-composer { position: sticky; bottom: 0; display: flex; align-items: center; gap: 8px; padding: 10px 13px 14px; border-top: 1px solid var(--app-line); background: var(--app-bg); }
.message-composer input { min-width: 0; flex: 1; height: 35px; padding: 0 13px; border: 1px solid var(--app-line); border-radius: 20px; outline: 0; background: var(--app-card); color: var(--app-ink); font: inherit; font-size: 11px; }
.message-composer button { width: 31px; height: 31px; flex: 0 0 31px; border: 0; border-radius: 50%; background: #a66f91; color: white; font-size: 18px; font-weight: 700; cursor: pointer; }

/* Notes */
.notes-screen { padding-bottom: 28px; }
.app-primary-button { min-height: 35px; padding: 0 14px; border: 0; border-radius: 10px; background: #a66f91; color: #fff; font: inherit; font-size: 10px; font-weight: 750; cursor: pointer; }
.notes-screen > .app-primary-button { display: block; margin: 0 20px 13px auto; }
.notes-list { padding: 0 19px; }
.note-row { width: 100%; display: flex; align-items: center; gap: 10px; padding: 13px 2px; border: 0; border-bottom: 1px solid var(--app-line); background: transparent; color: var(--app-ink); text-align: left; cursor: pointer; }
.note-row-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 5px; }
.note-row-copy strong { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.note-row-copy span { overflow: hidden; color: var(--app-muted); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.note-row time { color: var(--app-muted); font-size: 8px; white-space: nowrap; }
.note-editor { min-height: calc(100% - 53px); display: flex; flex-direction: column; padding: 17px 19px 22px; }
.note-title-input { width: 100%; padding: 7px 0; border: 0; outline: 0; background: transparent; color: var(--app-ink); font: inherit; font-size: 22px; font-weight: 800; letter-spacing: -.04em; }
.note-title-input::placeholder, .note-editor textarea::placeholder { color: var(--app-muted); opacity: .72; }
.note-editor-meta { margin: 1px 0 14px; color: var(--app-muted); font-size: 9px; }
.note-editor textarea { width: 100%; min-height: 300px; flex: 1; resize: vertical; border: 0; outline: 0; background: transparent; color: var(--app-ink); font: inherit; font-size: 12px; line-height: 1.65; }
.note-editor-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 14px; border-top: 1px solid var(--app-line); }
.app-text-button { border: 0; background: transparent; color: #a66f91; font: inherit; font-size: 10px; cursor: pointer; }
.app-text-button.danger { color: #bd5365; }

/* Calendar */
.calendar-screen { padding: 20px 18px 28px; }
.calendar-month-heading { display: flex; align-items: end; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
.calendar-nav { display: flex; gap: 7px; }
.calendar-nav button { width: 29px; height: 29px; border: 1px solid var(--app-line); border-radius: 50%; background: var(--app-card); color: var(--app-ink); font-size: 17px; cursor: pointer; }
.calendar-weekdays, .calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.calendar-weekdays { margin-bottom: 7px; }
.calendar-weekdays span { padding: 5px 0; color: var(--app-muted); font-size: 8px; font-weight: 700; text-align: center; }
.calendar-day { aspect-ratio: 1; display: grid; place-items: center; border: 0; border-radius: 50%; background: transparent; color: var(--app-ink); font: inherit; font-size: 10px; cursor: pointer; }
.calendar-day.is-outside { cursor: default; }
.calendar-day.is-today { outline: 1px solid #b17e9b; outline-offset: -2px; }
.calendar-day.is-selected { background: #a66f91; color: white; outline: 0; }
.calendar-today-button { display: block; margin: 12px 0 20px auto; padding: 5px 10px; border: 0; border-radius: 8px; background: var(--app-card-soft); color: #a66f91; font: inherit; font-size: 9px; font-weight: 750; cursor: pointer; }
.calendar-agenda { padding: 16px; border: 1px solid var(--app-line); border-radius: 15px; background: var(--app-card); }
.calendar-agenda h4 { margin: 5px 0 7px; color: var(--app-ink); font-size: 13px; }
.calendar-agenda > p:last-child { margin: 0; color: var(--app-muted); font-size: 10px; }

/* Settings */
.settings-screen { padding: 20px 18px 30px; }
.settings-profile { display: flex; align-items: center; gap: 12px; padding: 14px; margin-bottom: 25px; border-radius: 15px; background: var(--app-card); }
.settings-avatar { width: 43px; height: 43px; display: grid; place-items: center; border-radius: 50%; background: linear-gradient(145deg,#dcb8cd,#8e789e); color: white; font-size: 17px; font-weight: 800; }
.settings-profile div { display: flex; flex-direction: column; gap: 4px; }
.settings-profile strong { color: var(--app-ink); font-size: 12px; }
.settings-profile div span { color: var(--app-muted); font-size: 9px; }
.settings-section-label { margin: 0 4px 8px; }
.settings-group { overflow: hidden; border: 1px solid var(--app-line); border-radius: 14px; background: var(--app-card); }
.setting-row { min-height: 67px; display: flex; align-items: center; gap: 14px; padding: 11px 13px; border-bottom: 1px solid var(--app-line); }
.setting-row:last-child { border-bottom: 0; }
.setting-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.setting-copy strong { color: var(--app-ink); font-size: 11px; }
.setting-copy small { color: var(--app-muted); font-size: 8px; line-height: 1.4; }
.setting-switch { width: 38px; height: 23px; flex: 0 0 38px; padding: 2px; border: 0; border-radius: 20px; background: #c9c5cc; cursor: pointer; transition: background .18s ease; }
.setting-switch span { width: 19px; height: 19px; display: block; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .18s ease; }
.setting-switch.is-on { background: #7cae8c; }
.setting-switch.is-on span { transform: translateX(15px); }
.settings-footnote { margin: 12px 4px; color: var(--app-muted); font-size: 8px; line-height: 1.5; }

/* Camera mockup and apps awaiting their content pass */
.camera-screen { min-height: calc(100% - 53px); display: flex; flex-direction: column; justify-content: space-between; padding: 13px 15px 22px; background: #17151a; color: #fff; }
.camera-viewfinder { min-height: 380px; flex: 1; display: grid; place-items: center; position: relative; overflow: hidden; border-radius: 20px; background: radial-gradient(ellipse at 50% 40%, #64566c, #28232c 55%, #141218); transition: filter .12s ease; }
.camera-viewfinder.is-captured { filter: brightness(2.2); }
.camera-focus-frame { width: 54px; height: 54px; border: 1px solid rgba(255,255,255,.72); border-radius: 8px; }
.camera-preview-note { position: absolute; bottom: 13px; color: rgba(255,255,255,.55); font-size: 8px; }
.camera-controls { display: flex; align-items: center; justify-content: space-between; padding: 18px 13px 10px; }
.camera-mode { min-width: 45px; border: 0; background: transparent; color: rgba(255,255,255,.75); font-size: 9px; cursor: default; }
.camera-shutter { width: 58px; height: 58px; display: grid; place-items: center; border: 4px solid white; border-radius: 50%; background: transparent; cursor: pointer; }
.camera-shutter span { width: 42px; height: 42px; border-radius: 50%; background: white; }
.camera-disclaimer { margin: 0; color: rgba(255,255,255,.48); font-size: 8px; line-height: 1.5; text-align: center; }
.generic-app-screen { min-height: calc(100% - 53px); display: flex; align-items: center; justify-content: center; }
.generic-app-screen .app-empty-state { min-height: 310px; }
.app-placeholder-icon { width: 62px; height: 62px; margin-bottom: 17px; display: grid; place-items: center; border-radius: 19px; color: white; font-size: 27px; background: linear-gradient(145deg,#d5a4bc,#917baf); box-shadow: 0 8px 25px rgba(112,76,110,.2); }
.app-placeholder-icon svg { width: 28px; height: 28px; fill: none; stroke: currentColor; stroke-width: 1.5; }
.app-list { padding: 10px 15px; }
.app-list-row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 4px; border: 0; border-bottom: 1px solid var(--app-line); background: transparent; text-align: left; color: var(--app-ink); cursor: pointer; }
.app-list-avatar { width: 39px; height: 39px; flex: 0 0 39px; display: grid; place-items: center; border-radius: 50%; background: #eadbe7; color: #805a78; font-size: 13px; font-weight: 750; }
.app-list-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.app-list-copy strong { font-size: 12px; }
.app-list-copy span { overflow: hidden; color: var(--app-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.thread-empty { min-height: 65vh; display: grid; place-items: center; padding: 30px; text-align: center; color: var(--app-muted); font-size: 11px; }
@keyframes appOpen { from { opacity: 0; transform: translateY(12px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }

@media (max-height: 720px) {
  .app-layer { padding-top: 42px; }
  .app-page-heading { padding-top: 15px; }
  .thread-history { min-height: 185px; }
  .camera-viewfinder { min-height: 280px; }
}
@media (prefers-reduced-motion: reduce) {
  .app-layer, .setting-switch, .setting-switch span { animation: none; transition: none; }
}
