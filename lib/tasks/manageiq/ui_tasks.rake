namespace :update do
  task :bower do
    Dir.chdir ManageIQ::UI::Classic::Engine.root do
      system("bower update --allow-root -F --silent --config.analytics=false") || abort("\n== bower install failed ==")
    end
  end
end
