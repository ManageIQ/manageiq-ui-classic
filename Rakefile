require 'bundler/setup'
require 'bundler/gem_tasks'

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
    return [404, {}, []] unless File.exists?(path)

    return @rack_file.call(env) unless path.to_s.ends_with?('.haml')

    raw = File.read(path)
    compiled = Haml::Engine.new(raw).render

    [200, {"Content-Type" => "text/html"}, [compiled]]
  end
end

module Jasmine
  class << self
    alias old_initialize_config initialize_config

    def initialize_config
      old_initialize_config
      @config.add_rack_path('/static', lambda { StaticOrHaml.new })
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
end

task :default => :spec
