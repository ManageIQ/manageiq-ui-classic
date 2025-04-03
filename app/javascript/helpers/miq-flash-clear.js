const miqFlashClear = () => {
  const flashDiv = document.getElementById('flash_msg_div');
  if (flashDiv) {
    flashDiv.textContent = '';
  }
};

export default miqFlashClear;
