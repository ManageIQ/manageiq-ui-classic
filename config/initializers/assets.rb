Rails.application.config.assets.paths << Rails.root.join('vendor', 'assets', 'bower_components')

Rails.application.config.assets.precompile += %w(
  codemirror/modes/*.js
  codemirror/themes/*.css
  jquery
  jquery-1.8/jquery.js
  jquery_overrides.js
  noVNC/web-socket-js/WebSocketMain.swf
  novnc-rails
  remote_consoles/*.js
  spice-html5-bower
  spice-html5-bower/spiceHTML5/spicearraybuffer.js
  vmrc.css
)
