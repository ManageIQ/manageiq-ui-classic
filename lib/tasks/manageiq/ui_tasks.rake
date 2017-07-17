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
