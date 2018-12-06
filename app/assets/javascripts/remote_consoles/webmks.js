//= require jquery
//= require jquery-ui/ui/unique-id.js
//= require jquery-ui/ui/widget.js
//= require jquery-ui/ui/widgets/dialog.js
//= require jquery-ui/ui/widgets/button.js
//= require_tree ../locale
//= require gettext/all

$(function() {
  // WebMKS cannot be a part of the asset pipeline, therefore, it has to be loaded with this hack
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = '/webmks/css/wmks-all.css';
  document.head.appendChild(link);

  var script = document.createElement('script');

  script.onload = function() {
    var host = window.location.hostname;
    var encrypt = window.location.protocol === 'https:';
    var port = encrypt ? 443 : 80;
    if (window.location.port) {
      port = window.location.port;
    }
    var proto = encrypt ? 'wss' : 'ws';

    var options = {};
    // vCloud requires some extra attributes
    if ($('#remote-console').attr('data-is-vcloud')) {
      options.VCDProxyHandshakeVmxPath = $('#remote-console').attr('data-vmx');
      options.enableUint8Utf8 = true;
    }

    var wmks = WMKS.createWMKS('remote-console', options).register(WMKS.CONST.Events.CONNECTION_STATE_CHANGE, function(event, data) {
      if (data.state === WMKS.CONST.ConnectionState.CONNECTED) {
        $('#connection-status').text(__('Connected'));
        console.log('connection state change: connected');
      }
    });

    wmks.connect(proto + '://' + host + ':' + port + '/' + $('#remote-console').attr('data-url'));

    $('#ctrlaltdel').on('click', function() {
      wmks.sendCAD();
    });

    $('#keymap').on('change', function() {
      wmks.setOption('keyboardLayoutId', this.value);
    });
  };

  script.src = '/webmks/wmks.min.js';
  document.head.appendChild(script);
});
