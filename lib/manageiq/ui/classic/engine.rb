require 'rails/engine'
require 'sprockets/railtie'

require 'high_voltage'
require "novnc-rails"
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
        config.autoload_paths << root.join('app', 'controllers', 'mixins').to_s
        config.autoload_paths << root.join('lib').to_s

        if Rails.env.production? || Rails.env.test?
          require 'uglifier'
          config.assets.js_compressor = Uglifier.new(
            :compress => {
              :unused      => false,
              :keep_fargs  => true,
              :keep_fnames => true
            }
          )
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
