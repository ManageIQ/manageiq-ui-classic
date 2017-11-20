$(function() {
  $('#fullscreen').click(function() {
    switch (true) {
      case document.fullScreenEnabled:
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        break;
      case document.webkitFullscreenEnabled:
        if (document.webkitFullscreenElement) {
          document.webkitExitFullscreen();
        } else {
          document.documentElement.webkitRequestFullscreen();
        }
        break;
      case document.mozFullScreenEnabled:
        if (document.mozFullScreenElement) {
          document.mozCancelFullScreen();
        } else {
          document.documentElement.mozRequestFullScreen();
        }
        break;
    }
  });
});
