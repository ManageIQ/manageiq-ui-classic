require 'rails/all'
require 'sass-rails'
require 'coffee-rails'
require 'patternfly-sass'
require 'lodash-rails'
require 'jquery-hotkeys-rails'

module ManageIQ
  module UI
    module Classic
      class Engine < ::Rails::Engine
        config.autoload_paths << File.expand_path(File.join(root, 'app', 'controllers', 'mixins'), __FILE__)
        config.autoload_paths << File.expand_path(File.join(root, 'lib'), __FILE__)

        initializer 'manageiq-ui-classic.assets.precompile' do |app|
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

        def vmdb_plugin?
          true
        end
      end
    end
  end
end
