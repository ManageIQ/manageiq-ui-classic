import miqFlashClear from './miq-flash-clear';

const miqFlash = (type, msg, options) => {
  miqFlashClear();
  add_flash(msg, type, options);
};

export default miqFlash;
