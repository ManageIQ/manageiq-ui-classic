namespace :update do
  task :bower do
    Dir.chdir ManageIQ::UI::Classic::Engine.root do
      system("bower update --allow-root -F --config.analytics=false") || abort("\n== bower install failed ==")
    end
  end

  task :yarn do
    Dir.chdir ManageIQ::UI::Classic::Engine.root do
      system("yarn") || abort("\n== yarn failed ==")
    end
  end

  task :ui => ['update:bower', 'update:yarn']
end

# yarn:install is a rails 5.1 task, webpacker:compile needs it
namespace :yarn do
  task :install => ["update:yarn"]
end

# need the initializer for the rake tasks to work
require ManageIQ::UI::Classic::Engine.root.join('config/initializers/webpacker.rb')
load 'tasks/webpacker.rake'
load 'tasks/webpacker/compile.rake'
load 'tasks/webpacker/clobber.rake'
load 'tasks/webpacker/verify_install.rake'  # needed by compile
load 'tasks/webpacker/check_node.rake'  # needed by verify_install
load 'tasks/webpacker/check_yarn.rake'  # needed by verify_install

namespace :webpack do
  task :server do
    Dir.chdir ManageIQ::UI::Classic::Engine.root do
      system("bin/webpack-dev-server") || abort("\n== webpack-dev-server failed ==")
    end
  end
end

# needed by config/webpack/configuration.js
namespace :webpacker do
  task :output do
    puts Rails.root
  end
end
