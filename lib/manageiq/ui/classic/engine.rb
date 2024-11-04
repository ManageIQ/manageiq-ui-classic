require 'rails/engine'
require 'sprockets/railtie'

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
          config.assets.configure do |env|
            # Workaround rails 7 + es6 syntax in some js causing uglifier errors by running harmony mode
            # See: https://www.github.com/lautis/uglifier/issues/127
            # Note, we're purposely using our own compressor to avoid requiring uglifier at application boot time
            # since this require a js runtime such as node.
            require 'manageiq/ui/classic/js_compressor'
            env.register_compressor 'application/javascript', :manageiq_ui_classic_js_compressor, ManageIQ::UI::Classic::JsCompressor
          end
          config.assets.js_compressor = :manageiq_ui_classic_js_compressor
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
