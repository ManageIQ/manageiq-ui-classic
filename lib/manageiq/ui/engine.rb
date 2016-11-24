module Manageiq
  module Ui
    class Engine < ::Rails::Engine
      config.autoload_paths << File.expand_path(File.join('..', '..', '..', '..', 'app', 'controllers', 'mixins'), __FILE__)
    end
  end
end
