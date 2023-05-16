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
end

require 'high_voltage'
require 'webpacker'

module ManageIQ
  module UI
    module Classic
      class Engine < ::Rails::Engine
        # NOTE:  If you are going to make changes to autoload_paths, please make
        # sure they are all strings.  Rails will push these paths into the
        # $LOAD_PATH.
        #
        # More info can be found in the ruby-lang bug:
        #
        #   https://bugs.ruby-lang.org/issues/14372
        #
        config.autoload_paths << root.join('lib').to_s

        # The branding information needs to be stored outside the folder where the main
        # application.scss lives. The SassC::Rails::Importer always prefers the folder
        # from which the @import is called over the order set in the SASS load path.
        config.assets.paths << root.join('vendor', 'assets', 'stylesheets').to_s

        if Rails.env.production? || Rails.env.test?
          config.assets.js_compressor = :uglifier
        end

        def self.vmdb_plugin?
          true
        end

        def self.plugin_name
          _('Classic UI')
        end
      end
    end
  end
end
