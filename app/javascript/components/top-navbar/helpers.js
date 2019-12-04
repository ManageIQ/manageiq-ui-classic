export const showAboutModal = (e) => {
  e.preventDefault();
  return sendDataWithRx({ type: 'showAboutModal' });
};
