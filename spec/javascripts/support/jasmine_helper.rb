# Use this file to set/override Jasmine configuration options
# You can remove it if you don't need it.
# This file is loaded *after* jasmine.yml is interpreted.

class StaticOrHaml
  def initialize(dir = 'app/views/static')
    @dir = dir
    @rack_file = Rack::File.new(@dir)
  end

  def call(env)
    path = Pathname.new(@dir).join(env["PATH_INFO"].sub(/^\/+/, ''))
    return [404, {}, []] unless File.exist?(path)

    return @rack_file.call(env) unless path.to_s.ends_with?('.haml')

    raw = File.read(path)
    scope = ActionView::Base.new
    scope.controller = ActionController::Base.new
    scope.view_paths << File.expand_path("../app/views", __FILE__)

    scope.extend(ApplicationHelper)

    compiled = hamlit_compile(raw, scope)

    [200, {"Content-Type" => "text/html"}, [compiled]]
  end

  def hamlit_compile(template, scope)
    code = Hamlit::Engine.new.call(template)
    scope.instance_eval(code)
  end
end

class WebpackPack
  def initialize(dir = Rails.root.join('public', 'packs'))
    @dir = dir
    @manifest = JSON.parse(File.read(Pathname.new(@dir).join('manifest.json')))
  end

  def call(env)
    pack_name = env["PATH_INFO"].sub(/^\/+/, '')
    return [404, {}, ["Not in manifest.json: #{pack_name}"]] unless @manifest.key?(pack_name)

    pack_path = @manifest[pack_name].sub(/^\/+packs\/+/, '')

    path = Pathname.new(@dir).join(pack_path)
    return [404, {}, ["Not in public/packs: #{pack_path}"]] unless File.exist?(path)

    contents = File.read(path)
    [200, {"Content-Type" => "text/html"}, [contents]]
  end
end

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

  # serve haml templates from app/views/static/ on /static/
  config.add_rack_path('/static', -> { StaticOrHaml.new })

  # serve weback-compiled packs from public/packs/ on /packs/
  config.add_rack_path('/packs', -> { WebpackPack.new })
end
