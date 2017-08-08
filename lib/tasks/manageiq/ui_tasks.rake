namespace :update do
  task :bower do
    Dir.chdir ManageIQ::UI::Classic::Engine.root do
      system("bower update --allow-root -F --config.analytics=false") || abort("\n== bower install failed ==")
    end
  end

  task :yarn do
    asset_engines.each do |_name, dir|
      Dir.chdir dir do
        next unless File.file? 'package.json'
        system("yarn") || abort("\n== yarn failed in #{dir} ==")
      end
    end
  end

  task :ui => ['update:bower', 'update:yarn', 'webpack:compile']
end

namespace :webpack do
  task :server do
    root = ManageIQ::UI::Classic::Engine.root
    webpack_dev_server = root.join("bin", "webpack-dev-server").to_s
    system(webpack_dev_server) || abort("\n== webpack-dev-server failed ==")
  end

  [:compile, :clobber].each do |webpacker_task|
    task webpacker_task do
      Dir.chdir ManageIQ::UI::Classic::Engine.root do
        Rake::Task["webpack:paths"].invoke
        Rake::Task["webpacker:#{webpacker_task}"].invoke
      end
    end
  end
end

# compile and clobber when running assets:* tasks
if Rake::Task.task_defined?("assets:precompile")
  Rake::Task["assets:precompile"].enhance do
    Rake::Task["webpack:compile"].invoke
  end

  Rake::Task["assets:precompile"].actions.each do |action|
    if action.source_location[0].include?(File.join("lib", "tasks", "webpacker"))
      Rake::Task["assets:precompile"].actions.delete(action)
    end
  end
end
if Rake::Task.task_defined?("assets:clobber")
  Rake::Task["assets:clobber"].enhance do
    Rake::Task["webpack:clobber"].invoke
  end

  Rake::Task["assets:clobber"].actions.each do |action|
    if action.source_location[0].include?(File.join("lib", "tasks", "webpacker"))
      Rake::Task["assets:clobber"].actions.delete(action)
    end
  end
end

def asset_engines
  all_engines = Rails::Engine.subclasses.each_with_object({}) do |engine, acc|
    acc[engine] = engine.root.realpath.to_s
  end

  # we only read assets from app/javascript/, filtering engines based on existence of that dir
  all_engines.select do |_name, path|
    Dir.exist? File.join(path, 'app', 'javascript')
  end
end
