Rails.application.config.assets.paths << ManageIQ::UI::Classic::Engine.root.join('vendor', 'assets', 'bower') # all bower deps need to be prefixed by bower_components/, but vendor/assets/* can't be removed from paths :(
Rails.application.config.assets.paths << ManageIQ::UI::Classic::Engine.root.join('node_modules')

Rails.application.config.assets.precompile << proc do |filename, path|
  path =~ %r{app/assets} && !%w(.js .css).include?(File.extname(filename))
end

Rails.application.config.assets.precompile += %w(
  codemirror/mode/*.js
  codemirror/mode/*/*.js
  codemirror/theme/*.css

  jquery/dist/jquery.js
  bower_components/jquery-ui/jquery-ui.js

  jquery_overrides.js
  remote_consoles/*.js
  remote_console.js

  print.scss
)
