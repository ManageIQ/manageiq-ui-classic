require 'rails/engine'
require 'sprockets/railtie'

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
  require 'font-fabulous'
  require 'patternfly-sass'
else
  require 'bootstrap-sass/engine'
  require 'font_awesome/sass/rails/engine'
  require 'font-fabulous/engine'
  require 'patternfly-sass/engine'
end

require 'high_voltage'
require 'lodash-rails'
require 'jquery-hotkeys-rails'
require "novnc-rails"
require 'webpacker'

module ManageIQ
  module UI
    module Classic
      class Engine < ::Rails::Engine
        config.autoload_paths << root.join('app', 'controllers', 'mixins')
        config.autoload_paths << root.join('lib')
        if Rails.env.production?
          require 'uglifier'
          config.assets.js_compressor = Uglifier.new(
            :compress => {
              :unused      => false,
              :keep_fargs  => true,
              :keep_fnames => true
            }
          )
        end

        def vmdb_plugin?
          true
        end
      end
    end
  end
end
