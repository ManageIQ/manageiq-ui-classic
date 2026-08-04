window.$ = window.jQuery = require('jquery');
const RFB = require('@novnc/novnc').default;

require('../oldjs/i18n.js');
require('../oldjs/remote_console.js');

$(function() {
  const host = window.location.hostname;
  const encrypt = window.location.protocol === 'https:';
  let port = encrypt ? 443 : 80;

  if (window.location.port) {
    port = window.location.port;
  }

  const scheme = encrypt ? 'wss' : 'ws';

  const params = new URLSearchParams(window.location.search);

  const secret = params.get('secret');
  const dataUrl = params.get('url');

  const url = new URL(dataUrl, `${scheme}://${host}:${port}`).href;

  const rfb = new RFB(
    document.getElementById('remote-console'),
    url,
    {
      shared: true,
      credentials: {password: secret}
    }
  );

  rfb.addEventListener('connect', () => {
    $('#connection-status')
      .removeClass('label-danger label-warning')
      .addClass('label-success')
      .text(__('Connected'));
  });

  rfb.addEventListener('disconnect', (e) => {
    $('#connection-status')
      .removeClass('label-success label-warning')
      .addClass('label-danger')
      .text(__('Disconnected'));

    console.error('Disconnect:', e.detail.clean ? 'Clean' : 'Unclean');
  });

  $('#ctrlaltdel').click(() => {
    rfb.sendCtrlAltDel();
  });
});