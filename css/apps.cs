.app-layer { position: absolute; z-index: 20; inset: 0; padding-top: 47px; background: #f7f5f8; color: #211f25; animation: appOpen .28s cubic-bezier(.2,.8,.2,1) both; }
.app-surface { width: 100%; height: 100%; overflow: auto; background: #f7f5f8; padding-bottom: 30px; }
.app-header { min-height: 53px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 19px; border-bottom: 1px solid rgba(0,0,0,.07); background: rgba(255,255,255,.86); position: sticky; top: 0; z-index: 2; backdrop-filter: blur(16px); }
.app-header h2 { margin: 0; font-size: 16px; font-weight: 700; }
.app-back { border: 0; padding: 7px 0; background: transparent; color: #a45e83; font-size: 12px; cursor: pointer; }
.app-header-spacer { width: 42px; }
.app-placeholder { min-height: 72%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px; text-align: center; color: #827b86; }
.app-placeholder-icon { width: 62px; height: 62px; margin-bottom: 17px; display: grid; place-items: center; border-radius: 19px; color: white; font-size: 27px; background: linear-gradient(145deg,#d5a4bc,#917baf); box-shadow: 0 8px 25px rgba(112,76,110,.2); }
.app-placeholder h3 { margin: 0 0 7px; color: #302a35; font-size: 17px; }
.app-placeholder p { max-width: 230px; margin: 0; font-size: 11px; line-height: 1.6; }
.app-list { padding: 10px 15px; }
.app-list-row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 4px; border: 0; border-bottom: 1px solid #e9e5eb; background: transparent; text-align: left; color: #29242d; cursor: pointer; }
.app-list-avatar { width: 39px; height: 39px; flex: 0 0 39px; display: grid; place-items: center; border-radius: 50%; background: #eadbe7; color: #805a78; font-size: 13px; font-weight: 750; }
.app-list-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.app-list-copy strong { font-size: 12px; }
.app-list-copy span { overflow: hidden; color: #89828d; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.app-list-row .chevron { color: #b3aab6; font-size: 19px; }
.app-empty-note { margin: 18px 15px; padding: 14px; border-radius: 13px; background: #eee9f0; color: #7c7280; font-size: 10px; line-height: 1.5; text-align: center; }
.thread-empty { min-height: 65vh; display: grid; place-items: center; padding: 30px; text-align: center; color: #928995; font-size: 11px; }
@keyframes appOpen { from { opacity: 0; transform: translateY(12px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
