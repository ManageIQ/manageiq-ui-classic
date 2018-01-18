require 'rails/all'

# Since we serve our assets directly through apache on an appliance after they
# are pre-compiled, there is no need to have sass/coffeescript loaded in the
# application, so we can save a bit of resources by not loading these two.
#
# That said, we still need to load both of these when pre-compiling the assets
# in production mode, so if Rake is defined, load things like we used to.
#
# For this to work properly, it is dependent on patternfly/patternfly-sass#150
if ENV["RAILS_ENV"] != "production" || defined?(Rake)
  require 'sass-rails'
  require 'coffee-rails'
  require 'patternfly-sass'
else
  require 'bootstrap-sass/engine'
  require 'font_awesome/sass/rails/engine'

  require 'patternfly-sass/engine'
end

require 'lodash-rails'
require 'jquery-hotkeys-rails'

module ManageIQ
  module UI
    module Classic
      class Engine < ::Rails::Engine
        config.autoload_paths << root.join('app', 'controllers', 'mixins').to_s
        config.autoload_paths << root.join('lib').to_s

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
