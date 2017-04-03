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

        def vmdb_plugin?
          true
        end
      end
    end
  end
end
