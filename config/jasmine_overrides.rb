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

    compiled = Haml::Engine.new(raw).render(scope)

    [200, {"Content-Type" => "text/html"}, [compiled]]
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

module Jasmine
  class << self
    alias old_initialize_config initialize_config

    def initialize_config
      old_initialize_config

      # serve haml templates from app/views/static/ on /static/
      @config.add_rack_path('/static', -> { StaticOrHaml.new })

      # serve weback-compiled packs from public/packs/ on /packs/
      @config.add_rack_path('/packs', -> { WebpackPack.new })
    end

    alias old_server_is_listening_on server_is_listening_on

    def server_is_listening_on(_hostname, port)
      # hack around Travis resolving localhost to IPv6 and failing
      old_server_is_listening_on('127.0.0.1', port)
    end
  end

  class Configuration
    alias old_initialize initialize

    def initialize
      # hack around Travis resolving localhost to IPv6 and failing
      @host = 'http://127.0.0.1'
      old_initialize
    end
  end
end
