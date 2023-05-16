Rails.application.config.assets.paths << ManageIQ::UI::Classic::Engine.root.join('node_modules')

Rails.application.config.assets.precompile << proc do |filename, path|
  path.include?('app/assets') && %w[.js .css].exclude?(File.extname(filename))
end
