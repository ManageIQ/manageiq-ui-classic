require 'bundler/setup'
require 'bundler/gem_tasks'
require 'English'

require 'manageiq/ui/classic'
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
    t.pattern = FileList[spec_dir + '/**/*_spec.rb'].exclude(spec_dir + '/manageiq/**/*_spec.rb').exclude(spec_dir + '/routes_spec.rb')
  end
end

# Only load the jasmine tasks if we are within this repo, otherwise, the bundle
# won't contain the jasmine gem (i.e., from manageiq)
if ENV["BUNDLE_GEMFILE"].nil? || ENV["BUNDLE_GEMFILE"] == File.expand_path("../Gemfile", __FILE__)
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
  require './config/jasmine_overrides'

  # running jasmine outside ci ignores the `random: false` in `jasmine.yml` - needs a message
  task :jasmine_url do
    puts
    puts "Please open http://localhost:#{Jasmine.config.port(:server)}/?random=false"
    puts
  end

  Rake::Task['jasmine'].prerequisites.unshift 'jasmine_url'
end

namespace :spec do
  desc "Run all routing specs"
  RSpec::Core::RakeTask.new(:routes => 'app:test:initialize') do |t|
    spec_dir = File.expand_path("spec", __dir__)
    EvmTestHelper.init_rspec_task(t, ['--require', File.join(spec_dir, 'spec_helper')])
    t.pattern = FileList[File.expand_path('spec/routes_spec.rb', __dir__)]
  end

  desc "Run all javascript specs"
  task :javascript => ["app:test:initialize", :environment, "jasmine:ci"]

  desc "Try to compile assets"
  task :compile => ["app:assets:precompile"]

  desc "Run Jest tests"
  task :jest do
    system('NODE_OPTIONS=--max_old_space_size=4096 yarn test')
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

  desc "Run Debride"
  task :debride do
    system('bash bin/ci/dead_method_check.sh')
    exit 0
  end

  desc "Run security specs from core"
  task :security => ["app:test:security"]

  desc "Run cypress specs (starts a Rails server)"
  task :cypress => "cypress:run_with_rails"

  namespace :cypress do
    task :run_with_rails do
      # Set the rate limit to a large number to avoid 429: Too Many Requests errors
      # which can occur as cypress very quickly hits a lots of endpoints.
      puts "\n== Removing rate limit =="
      exit $?.exitstatus unless system("bundle exec rails runner 'MiqServer.my_server.add_settings_for_resource(:server => {:rate_limiting => {:request => {:limit => 99999}}})'")

      puts "\n== Starting Rails server =="
      rails_pid = Bundler.with_original_env do
        spawn("bin/rails s", [:out, :err] => "/dev/null")
      end
      puts "== Rails server started with PID #{rails_pid} =="

      Rake::Task["spec:cypress:run"].invoke
    ensure
      if rails_pid
        puts "\n== Killing Rails server with PID #{rails_pid} =="
        Process.kill("INT", rails_pid)
      end
    end

    desc "Run cypress specs (with a running Rails server)"
    task :run do
      ENV["CYPRESS_BROWSER"] ||= "chrome"

      puts "\n== Cypress tests started for #{ENV["CYPRESS_BROWSER"]} browser =="
      system("yarn cypress:run:#{ENV["CYPRESS_BROWSER"]}")
      exit_status = $?.exitstatus
      puts "== Cypress tests for #{ENV["CYPRESS_BROWSER"]} browser completed =="

      exit exit_status
    end
  end
end

task :default => ENV["TEST_SUITE"] || :spec
