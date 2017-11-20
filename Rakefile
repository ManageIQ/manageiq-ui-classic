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

require 'jasmine'
load 'jasmine/tasks/jasmine.rake'

# hack around Travis resolving localhost to IPv6 and failing
module Jasmine
  class << self
    alias old_server_is_listening_on server_is_listening_on

    def server_is_listening_on(_hostname, port)
      old_server_is_listening_on('127.0.0.1', port)
    end
  end

  class Configuration
    alias old_initialize initialize

    def initialize
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
end

task :default => :spec
