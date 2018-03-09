require 'bundler/setup'
require 'bundler/gem_tasks'
require 'English'

require 'manageiq-ui-classic'
ManageIQ::UI::Classic::Engine.load_tasks

begin
  require 'rspec/core/rake_task'

  APP_RAKEFILE = File.expand_path("../spec/manageiq/Rakefile", __FILE__)
  load 'rails/tasks/engine.rake'
rescue LoadError
end

if defined?(RSpec) && defined?(RSpec::Core::RakeTask)
  namespace :spec do
    desc "Setup environment for specs"
    task :setup => ["app:test:initialize", "app:test:verify_no_db_access_loading_rails_environment", "app:test:setup_db"]
  end

  RSpec::Core::RakeTask.new(:spec => ["app:test:initialize", "app:evm:compile_sti_loader"]) do |t|
    spec_dir = File.expand_path("spec", __dir__)
    EvmTestHelper.init_rspec_task(t, ['--require', File.join(spec_dir, 'spec_helper')])
    t.pattern = FileList[spec_dir + '/**/*_spec.rb'].exclude(spec_dir + '/manageiq/**/*_spec.rb')
  end
end

# Only load the jasmine tasks if we are within this repo, otherwise, the bundle
# won't contain the jasmine gem (i.e., from manageiq)
if ENV["BUNDLE_GEMFILE"].nil? || ENV["BUNDLE_GEMFILE"] == File.expand_path("../Gemfile", __FILE__)
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
end

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

module Jasmine
  class << self
    alias old_initialize_config initialize_config

    def initialize_config
      old_initialize_config

      # serve haml templates from app/views/static/ on /static/
      @config.add_rack_path('/static', -> { StaticOrHaml.new })

      # serve weback-compiled packs from public/packs/ on /packs/
      @config.add_rack_path('/packs', -> { Rack::File.new(Rails.root.join('public', 'packs')) })
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

namespace :spec do
  namespace :javascript do
    desc "Setup environment for javascript specs"
    task :setup
  end

  desc "Run all javascript specs"
  task :javascript => ["app:test:initialize", :environment, "jasmine:ci"]

  namespace :compile do
    desc "Does nothing, needed by Travis"
    task :setup
  end

  desc "Try to compile assets"
  task :compile => ["app:assets:precompile"]

  desc "run Jest tests"
  task :jest do
    system('yarn test')
    exit $CHILD_STATUS.exitstatus
  end

  namespace :jest do
    desc 'Run Jest tests with node debugger'
    task :debug do
      puts
      puts "open your chrome://inspect/#devices on your chrome based browser (see https://facebook.github.io/jest/docs/en/troubleshooting.html for more details)"
      puts
      system('node --inspect-brk node_modules/.bin/jest --runInBand')
    end

  end
  namespace :jest do
    desc "Does nothing, needed by Travis"
    task :setup
  end
end

task :default => :spec
