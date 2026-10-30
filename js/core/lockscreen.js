
import { CONFIG } from '../../data/config.js';

export function initLockScreen(onUnlock) {
  const lockScreen = document.querySelector('#lock-screen');
  const passcodeScreen = document.querySelector('#passcode-screen');
  const unlockButton = document.querySelector('#unlock-button');
  const cancelButton = document.querySelector('#passcode-cancel');
  const dots = [...document.querySelectorAll('#passcode-dots i')];
  const error = document.querySelector('#passcode-error');
  const keypad = document.querySelector('#keypad');

  let entered = '';
  let resetTimer = null;
  let unlockTimer = null;
  let isSubmitting = false;
  let isUnlocked = false;

  function paintDots() {
    dots.forEach((dot, index) => {
      dot.classList.toggle('filled', index < entered.length);
    });
  }

  function clearTimers() {
    if (resetTimer !== null) {
      window.clearTimeout(resetTimer);
      resetTimer = null;
    }

    if (unlockTimer !== null) {
      window.clearTimeout(unlockTimer);
      unlockTimer = null;
    }
  }

  function reset() {
    if (resetTimer !== null) {
      window.clearTimeout(resetTimer);
      resetTimer = null;
    }

    entered = '';
    isSubmitting = false;
    error.textContent = '';
    paintDots();
  }

  function showPasscode() {
    if (isUnlocked) return;

    reset();
    passcodeScreen.classList.remove('is-hidden');
  }

  function hidePasscode() {
    clearTimers();
    reset();
    passcodeScreen.classList.add('is-hidden');
  }

  function unlock() {
    if (isUnlocked) return;

    clearTimers();
    isUnlocked = true;
    entered = '';
    paintDots();

    passcodeScreen.classList.add('is-hidden');
    lockScreen.classList.add('is-hidden');

    onUnlock();
  }

  function submitDigit(digit) {
    if (isUnlocked || isSubmitting) return;
    if (!/^\d$/.test(String(digit))) return;
    if (entered.length >= CONFIG.passcodeLength) return;

    entered += digit;
    paintDots();

    if (entered.length !== CONFIG.passcodeLength) return;

    if (entered === CONFIG.demoPasscode) {
      isSubmitting = true;

      unlockTimer = window.setTimeout(() => {
        unlockTimer = null;
        unlock();
      }, 180);

      return;
    }

    isSubmitting = true;
    error.textContent = 'Incorrect passcode. Try again.';

    resetTimer = window.setTimeout(() => {
      resetTimer = null;
      reset();
    }, 550);
  }

  function handleKeypadClick(event) {
    const button = event.target.closest('button[data-key]');
    if (!button || !keypad.contains(button)) return;

    const key = button.dataset.key;

    if (key === 'delete') {
      if (isSubmitting || isUnlocked) return;

      entered = entered.slice(0, -1);
      error.textContent = '';
      paintDots();
      return;
    }

    submitDigit(key);
  }

  function handleKeyboard(event) {
    if (passcodeScreen.classList.contains('is-hidden')) return;

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      submitDigit(event.key);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();

      if (isSubmitting || isUnlocked) return;

      entered = entered.slice(0, -1);
      error.textContent = '';
      paintDots();
      return;
    }

    if (event.key === 'Escape') {
      hidePasscode();
    }
  }

  unlockButton.addEventListener('click', showPasscode);
  cancelButton.addEventListener('click', hidePasscode);
  keypad.addEventListener('click', handleKeypadClick);
  window.addEventListener('keydown', handleKeyboard);

  // Membersihkan timer dan listener apabila sistem diinisialisasi ulang.
  return function cleanupLockScreen() {
    clearTimers();

    unlockButton.removeEventListener('click', showPasscode);
    cancelButton.removeEventListener('click', hidePasscode);
    keypad.removeEventListener('click', handleKeypadClick);
    window.removeEventListener('keydown', handleKeyboard);
  };
}
