//= require jquery
//= require spice-html5-bower/spice-html5-rails
//= require_tree ../locale
//= require gettext/all

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

  $('#ctrlaltdel').click(function() {sendCtrlAltDel(spice);});
});
