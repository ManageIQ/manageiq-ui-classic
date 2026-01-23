window.$ = window.jQuery = require('jquery');
const RFB = require('@novnc/novnc').default;
require('../oldjs/i18n.js');
require('../oldjs/remote_console.js');

$(function() {
  var host = window.location.hostname;
  var encrypt = window.location.protocol === 'https:';
  var port = encrypt ? 443 : 80;
  if (window.location.port) {
    port = window.location.port;
  }

  var scheme = encrypt ? 'wss' : 'ws';

  var urlParams = new URLSearchParams(window.location.search);
  var secret = urlParams.get('secret');
  var dataUrl = urlParams.get('url');
  var url = new URL(dataUrl, `${scheme}://${host}:${port}`).href;

  var vnc = new RFB(document.getElementById('remote-console'), url, {
    shared: true,
    credentials: { password: secret }
  });

  vnc.addEventListener('connect', function() {
    $('#connection-status').removeClass('label-danger label-warning').addClass('label-success');
    $('#connection-status').text(__('Connected'));
  });

  vnc.addEventListener('disconnect', function(e) {
    $('#connection-status').removeClass('label-success label-warning').addClass('label-danger');
    $('#connection-status').text(__('Disconnected'));
    console.error('VNC disconnect:', e.detail.clean ? 'Clean' : 'Unclean');
  });

  $('#ctrlaltdel').on('click', function() {
    vnc.sendCtrlAltDel();
  });
});
