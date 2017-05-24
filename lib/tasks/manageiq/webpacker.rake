if File.exist? 'manageiq-ui-classic.gemspec'
  # all of these tasks are only internal ui-classic, used by webpack:server, webpack:compile or webpack:clobber

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
    # needed by config/webpack/configuration.js
    task :output do
      puts Rails.root
    end
  end
end
