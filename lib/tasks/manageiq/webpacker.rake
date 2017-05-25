if File.exist? 'manageiq-ui-classic.gemspec'
  # all of these tasks are only internal ui-classic, used by webpack:server, webpack:compile or webpack:clobberr
  # mostly because they fail when run from manageiq/

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
  load 'tasks/webpacker/check_webpack_binstubs.rake'  # needed by verify_install

  namespace :webpack do
    # needed by config/webpack/configuration.js
    task :output do
      puts Rails.root
    end

    # needed to read assets from all engines
    task :engines do
      all_engines = Rails::Engine.subclasses.each_with_object({}) do |engine, acc|
        acc[engine] = engine.root.realpath.to_s
      end

      # we only read assets from app/javascript/, filtering engines based on existence of that dir
      asset_engines = all_engines.select do |_name, path|
        Dir.exist? File.join(path, 'app', 'javascript')
      end

      puts asset_engines.to_json
    end
  end
end
