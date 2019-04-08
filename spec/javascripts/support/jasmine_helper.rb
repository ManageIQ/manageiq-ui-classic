# Use this file to set/override Jasmine configuration options
# You can remove it if you don't need it.
# This file is loaded *after* jasmine.yml is interpreted.

Jasmine.configure do |config|
  # never install phantomjs
  config.prevent_phantom_js_auto_install = true

  # use chrome headless for jasmine:ci
  config.runner = lambda do |formatter, jasmine_server_url|
    Jasmine::Runners::ChromeHeadless.new(formatter, jasmine_server_url, config)
  end

  config.chrome_binary = 'google-chrome-beta'
  config.chrome_cli_options = {
    'headless' => nil,
    'disable-gpu' => nil,
    'remote-debugging-port' => 9222,
  }
  config.chrome_startup_timeout = 20

  warn 'Disabling webmock!'
  require 'webmock'
  WebMock.allow_net_connect!
end
