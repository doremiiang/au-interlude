import { CONFIG } from '../../data/config.js';

export function initLockScreen(onUnlock) {
  const lockScreen = document.querySelector('#lock-screen');
  const passcodeScreen = document.querySelector('#passcode-screen');
  const dots = [...document.querySelectorAll('#passcode-dots i')];
  const error = document.querySelector('#passcode-error');
  const keypad = document.querySelector('#keypad');
  let entered = '';

  const paintDots = () => dots.forEach((dot, index) => dot.classList.toggle('filled', index < entered.length));
  const reset = () => { entered = ''; paintDots(); error.textContent = ''; };
  const showPasscode = () => { reset(); passcodeScreen.classList.remove('is-hidden'); };
  const hidePasscode = () => passcodeScreen.classList.add('is-hidden');
  const unlock = () => {
    lockScreen.classList.add('is-hidden');
    hidePasscode();
    onUnlock();
  };
  const submitDigit = (digit) => {
    if (entered.length >= CONFIG.passcodeLength) return;
    entered += digit;
    paintDots();
    if (entered.length === CONFIG.passcodeLength) {
      if (entered === CONFIG.demoPasscode) {
        window.setTimeout(unlock, 180);
      } else {
        error.textContent = 'Incorrect passcode. Try again.';
        window.setTimeout(reset, 550);
      }
    }
  };

  document.querySelector('#unlock-button').addEventListener('click', showPasscode);
  document.querySelector('#passcode-cancel').addEventListener('click', hidePasscode);
  keypad.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-key]');
    if (!button) return;
    const key = button.dataset.key;
    if (key === 'delete') { entered = entered.slice(0, -1); paintDots(); error.textContent = ''; }
    else submitDigit(key);
  });
  window.addEventListener('keydown', (event) => {
    if (passcodeScreen.classList.contains('is-hidden')) return;
    if (/^\d$/.test(event.key)) submitDigit(event.key);
    if (event.key === 'Backspace') { entered = entered.slice(0, -1); paintDots(); }
    if (event.key === 'Escape') hidePasscode();
  });
}
