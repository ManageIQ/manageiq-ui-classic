require 'patternfly-sass'

module Manageiq
  module Ui
    class Engine < ::Rails::Engine
      config.autoload_paths << File.expand_path(File.join(root, 'app', 'controllers', 'mixins'), __FILE__)
      config.autoload_paths << File.expand_path(File.join(root, 'lib'), __FILE__)
    end
  end
end
