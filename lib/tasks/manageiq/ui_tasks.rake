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

namespace :webpack do
  task :server do
    Dir.chdir ManageIQ::UI::Classic::Engine.root do
      system("bin/webpack-dev-server") || abort("\n== webpack-dev-server failed ==")
    end
  end

  [:compile, :clobber].each do |webpacker_task|
    task webpacker_task do
      Dir.chdir ManageIQ::UI::Classic::Engine.root do
        Bundler.with_clean_env do
          system("bundle exec rake webpacker:#{webpacker_task}") || abort("\n== webpacker:#{webpacker_task} failed ==")
        end
      end
    end
  end
end
