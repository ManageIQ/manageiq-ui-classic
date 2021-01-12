window.$ = window.jQuery = require('jquery');
require('spice-html5-bower/spiceHTML5/enums.js');
require('spice-html5-bower/spiceHTML5/atKeynames.js');
require('spice-html5-bower/spiceHTML5/utils.js');
require('spice-html5-bower/spiceHTML5/png.js');
require('spice-html5-bower/spiceHTML5/lz.js');
require('spice-html5-bower/spiceHTML5/quic.js');
require('spice-html5-bower/spiceHTML5/bitmap.js');
require('spice-html5-bower/spiceHTML5/spicedataview.js');
require('spice-html5-bower/spiceHTML5/spicetype.js');
require('spice-html5-bower/spiceHTML5/spicemsg.js');
require('spice-html5-bower/spiceHTML5/wire.js');
require('spice-html5-bower/spiceHTML5/spiceconn.js');
require('spice-html5-bower/spiceHTML5/display.js');
require('spice-html5-bower/spiceHTML5/main.js');
require('spice-html5-bower/spiceHTML5/inputs.js');
require('spice-html5-bower/spiceHTML5/cursor.js');
require('spice-html5-bower/spiceHTML5/thirdparty/jsbn.js');
require('spice-html5-bower/spiceHTML5/thirdparty/rsa.js');
require('spice-html5-bower/spiceHTML5/thirdparty/prng4.js');
require('spice-html5-bower/spiceHTML5/thirdparty/rng.js');
require('spice-html5-bower/spiceHTML5/thirdparty/sha1.js');
require('spice-html5-bower/spiceHTML5/ticket.js');
require('spice-html5-bower/spiceHTML5/filexfer.js');
require('spice-html5-bower/spiceHTML5/playback.js');
require('spice-html5-bower/spiceHTML5/resize.js');
require('spice-html5-bower/spiceHTML5/webm.js');
require('spice-html5-bower/spiceHTML5/port.js');
require('../../oldjs/i18n.js');
require('../../oldjs/remote_console.js');

$(function() {
  var host = window.location.hostname;
  var encrypt = window.location.protocol === 'https:';
  var port = encrypt ? 443 : 80;
  if (window.location.port) {
    port = window.location.port;
  }

  var spice = new SpiceMainConn({
    uri: (encrypt ? 'wss://' : 'ws://') + host + ':' + port + '/' + $('#remote-console').attr('data-url'),
    screen_id: 'remote-console',
    password: $('#remote-console').attr('data-secret'),
    onerror: function(e) {
      spice.stop();
      $('#connection-status').removeClass('label-success label-warning').addClass('label-danger');
      $('#connection-status').text(__('Disconnected'));
      console.error('SPICE', e);
    },
    onsuccess: function() {
      $('#connection-status').removeClass('label-danger label-warning').addClass('label-success');
      $('#connection-status').text(__('Connected'));
    },
  });

  $('#ctrlaltdel').click(function() {
    sendCtrlAltDel(spice);
  });
});
