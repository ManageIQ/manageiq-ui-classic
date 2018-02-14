Rails.application.config.assets.paths << ManageIQ::UI::Classic::Engine.root.join('vendor', 'assets', 'bower') # all bower deps need to be prefixed by bower_components/, but vendor/assets/* can't be removed from paths :(
Rails.application.config.assets.paths << ManageIQ::UI::Classic::Engine.root.join('node_modules')

Rails.application.config.assets.precompile << proc do |filename, path|
  path =~ %r{app/assets} && !%w(.js .css).include?(File.extname(filename))
end

Rails.application.config.assets.precompile += %w(
  bower_components/codemirror/modes/*.js
  bower_components/codemirror/themes/*.css
  bower_components/jquery/dist/jquery.js
  bower_components/jquery-ui/jquery-ui.js
  bower_components/tota11y/build/tota11y.js

  jquery_overrides.js
  remote_consoles/*.js
  remote_console.js
)

if Rails.env.development?
  Rails.application.config.assets.precompile += %w(
    bower_components/tota11y/build/tota11y.js
  )
end
