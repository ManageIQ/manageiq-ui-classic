/* global miqFlashLater */

const miqRedirectBack = (message, flashType, redirectUrl) => {
  miqFlashLater({ message, level: flashType });
  window.location.href = redirectUrl;
};

export default miqRedirectBack;
