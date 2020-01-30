Rails.application.config.assets.paths << ManageIQ::UI::Classic::Engine.root.join('node_modules')

Rails.application.config.assets.precompile << proc do |filename, path|
  path =~ %r{app/assets} && !%w(.js .css).include?(File.extname(filename))
end

Rails.application.config.assets.precompile += %w(
  jquery/dist/jquery.js
  jquery-ui/ui/*.js
  jquery-ui/ui/widgets/*.js

  jquery_overrides.js
  remote_consoles/*.js
  remote_console.js

  print.scss
  report_colors.scss

  jasmine-jquery/lib/jasmine-jquery.js
  angular-mocks/angular-mocks.js
)
