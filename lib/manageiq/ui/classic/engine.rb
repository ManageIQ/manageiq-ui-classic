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
        config.autoload_paths << File.expand_path(File.join(root, 'app', 'controllers', 'mixins'), __FILE__)
        config.autoload_paths << File.expand_path(File.join(root, 'lib'), __FILE__)
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
