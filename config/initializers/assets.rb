Rails.application.config.assets.paths << ManageIQ::UI::Classic::Engine.root.join('vendor', 'assets', 'bower_components')
Rails.application.config.assets.paths << ManageIQ::UI::Classic::Engine.root.join('node_modules')

Rails.application.config.assets.precompile << proc do |filename, path|
  path =~ %r{app/assets} && !%w(.js .css).include?(File.extname(filename))
end

Rails.application.config.assets.precompile += %w(
  codemirror/modes/*.js
  codemirror/themes/*.css
  jquery
  jquery-ui
  jquery_overrides.js
  remote_consoles/*.js
  remote_console.js
)
