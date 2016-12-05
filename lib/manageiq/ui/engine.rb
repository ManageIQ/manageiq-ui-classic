require 'patternfly-sass'

module Manageiq
  module Ui
    class Engine < ::Rails::Engine
      config.autoload_paths << File.expand_path(File.join(root, 'app', 'controllers', 'mixins'), __FILE__)
      config.autoload_paths << File.expand_path(File.join(root, 'lib'), __FILE__)

      initializer 'manageiq-ui.assets.precompile' do |app|
        app.config.assets.precompile << proc do |filename, path|
          path =~ %r{app/assets} && !%w(.js .css).include?(File.extname(filename))
        end
        app.config.assets.precompile += %w(
          jquery-1.8/jquery.js jquery_overrides.js jquery vmrc.css
          novnc-rails noVNC/web-socket-js/WebSocketMain.swf
          spice-html5-bower spice-html5-bower/spiceHTML5/spicearraybuffer.js
          codemirror/modes/*.js codemirror/themes/*.css
        )
      end
    end
  end
end
