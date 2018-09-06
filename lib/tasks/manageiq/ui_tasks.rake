namespace :update do
  task :bower do
    Dir.chdir ManageIQ::UI::Classic::Engine.root do
      system("bower update --allow-root -F --config.analytics=false") || abort("\n== bower install failed ==")
    end
  end

  task :yarn do
    asset_engines.each do |engine|
      Dir.chdir engine.path do
        next unless File.file? 'package.json'
        system("yarn") || abort("\n== yarn failed in #{engine.path} ==")
      end
    end
  end

  task :clean do
    # clean up old bower install to prevent it from winning over npm
    FileUtils.rm_rf(ManageIQ::UI::Classic::Engine.root.join('vendor', 'assets', 'bower_components'))

    # clean up old webpack packs to prevent stale packs now that we're hashing the filenames
    FileUtils.rm_rf(Rails.root.join('public', 'packs'))
  end

  task :print_engines do
    puts
    puts "JS plugins:"
    asset_engines.each do |engine|
      puts "  #{engine.name}:"
      puts "    namespace: #{engine.namespace}"
      puts "    path: #{engine.path}"
    end
    puts
  end

  task :actual_ui => ['update:clean', 'update:bower', 'update:yarn', 'webpack:compile', 'update:print_engines']

  task :ui do
    # when running update:ui from ui-classic, asset_engines won't see the other engines
    # the same goes for Rake::Task#invoke
    if defined?(ENGINE_ROOT) && !ENV["TRAVIS"]
      Dir.chdir Rails.root do
        Bundler.with_clean_env do
          system("bundle exec rake update:actual_ui")
        end
      end
    else
      Rake::Task['update:actual_ui'].invoke
    end
  end
end

namespace :ui do
  desc "Clean up node_modules and bower assets for all stale ui_classic gems on the system"
  task :clean do
    require 'fileutils'

    gem_regexp     = Regexp.new("(#{asset_engines_plugins_hash.keys.join('|')})")
    git_dirs       = Dir["#{Gem.dir}/bundler/gems/*"].grep(gem_regexp)
    spec_git_paths = Bundler.definition.spec_git_paths.grep(gem_regexp)
    stale_ui_gems  = (git_dirs - spec_git_paths)
    total_savings  = 0

    warn "DRY RUN:  NO OPERATIONS BEING EXECUTED!!" if ENV["DRY_RUN"]

    stale_ui_gems.each do |stale_miq_ui_gem_dir|
      [
        File.join(stale_miq_ui_gem_dir, "node_modules"),
        File.join(stale_miq_ui_gem_dir, "vendor", "assets", "bower")
      ].each do |file_path_to_delete|
        path = Pathname.new(file_path_to_delete)
        next unless path.exist?

        # Disk usage code pulled from Homebrew.  License for Homebrew below:
        #
        # BSD 2-Clause License
        #
        # Copyright (c) 2009-present, Homebrew contributors
        # All rights reserved.
        #
        # Redistribution and use in source and binary forms, with or without
        # modification, are permitted provided that the following conditions are met:
        #
        # * Redistributions of source code must retain the above copyright notice, this
        #   list of conditions and the following disclaimer.
        #
        # * Redistributions in binary form must reproduce the above copyright notice,
        #   this list of conditions and the following disclaimer in the documentation
        #   and/or other materials provided with the distribution.
        #
        # THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
        # AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
        # IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
        # DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
        # FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
        # DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
        # SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
        # CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
        # OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
        # OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        disk_usage = begin
                       disk_size_path = if path.symlink?
                                          path.dirname.join(path.readlink)
                                        else
                                          path
                                        end

                       if disk_size_path.directory?
                         scanned_files = Set.new
                         disk_usage = 0
                         path.find do |f|
                           if f.directory?
                             disk_usage += f.lstat.size
                           else
                             # use Pathname#lstat instead of Pathname#stat to get info of symlink itself.
                             stat = f.lstat
                             file_id = [stat.dev, stat.ino]
                             # count hardlinks only once.
                             unless scanned_files.include?(file_id)
                               disk_usage += stat.size
                               scanned_files.add(file_id)
                             end
                           end
                         end
                       else
                         disk_usage = path.lstat.size
                       end

                       total_savings += disk_usage
                       disk_usage.to_f / 1_048_576
                     end

        puts "Removing #{path}... (#{'%.1f' % disk_usage}MB)"
        FileUtils.rm_rf path, :secure => true, :noop => !!ENV["DRY_RUN"]
      end
    end

    total = if total_savings >= 1_073_741_824
              "#{'%.1f' % (total_savings.to_f / 1_073_741_824)}GB"
            else
              "#{'%.1f' % (total_savings.to_f / 1_048_576)}MB"
            end

    puts "\nTotal Savings: #{total}"
  end
end

namespace :webpack do
  task :server do
    root = ManageIQ::UI::Classic::Engine.root
    webpack_dev_server = root.join("bin", "webpack-dev-server").to_s
    system(webpack_dev_server) || abort("\n== webpack-dev-server failed ==")
  end

  [:compile, :clobber].each do |webpacker_task|
    task webpacker_task do
      # Run the `webpack:compile` tasks without a fully loaded environment,
      # since when doing an appliance/docker build, a database isn't
      # available for the :environment task (prerequisite for
      # 'webpacker:compile') to function.
      EvmRakeHelper.with_dummy_database_url_configuration do
        Dir.chdir ManageIQ::UI::Classic::Engine.root do
          Rake::Task["webpack:paths"].invoke
          Rake::Task["webpacker:#{webpacker_task}"].invoke
        end
      end
    end
  end

  task :paths do
    json = JSON.pretty_generate(
      :info    => "This file is autogenerated by rake webpack:paths, do not edit",
      :output  => Rails.root.to_s,
      :engines => asset_engines.map { |p|
                    key = p.namespace
                    value = {:root => p.path,
                             :node_modules => File.join(p.path, 'node_modules')}

                    [key, value]
                  }.to_h
    ) << "\n"

    File.write(ManageIQ::UI::Classic::Engine.root.join('config/webpack/paths.json'), json)
  end
end

# compile and clobber when running assets:* tasks
if Rake::Task.task_defined?("assets:precompile")
  Rake::Task["assets:precompile"].enhance do
    Rake::Task["webpack:compile"].invoke unless ENV["TRAVIS"]
  end

  Rake::Task["assets:precompile"].actions.each do |action|
    if action.source_location[0].include?(File.join("lib", "tasks", "webpacker"))
      Rake::Task["assets:precompile"].actions.delete(action)
    end
  end
end

if Rake::Task.task_defined?("assets:clobber")
  Rake::Task["assets:clobber"].enhance do
    Rake::Task["webpack:clobber"].invoke unless ENV["TRAVIS"]
  end

  Rake::Task["assets:clobber"].actions.each do |action|
    if action.source_location[0].include?(File.join("lib", "tasks", "webpacker"))
      Rake::Task["assets:clobber"].actions.delete(action)
    end
  end
end

# yarn:install is a rails 5.1 task, webpacker:compile needs it
namespace :yarn do
  task :install do
    puts 'yarn:install called, not doing anything'
  end
end

# need the initializer for the rake tasks to work
require ManageIQ::UI::Classic::Engine.root.join('config/initializers/webpacker.rb')
unless Rake::Task.task_defined?("webpacker")
  load 'tasks/webpacker.rake'
  load 'tasks/webpacker/clobber.rake'
  load 'tasks/webpacker/verify_install.rake'         # needed by compile
  load 'tasks/webpacker/check_node.rake'             # needed by verify_install
  load 'tasks/webpacker/check_yarn.rake'             # needed by verify_install
  load 'tasks/webpacker/check_webpack_binstubs.rake' # needed by verify_install
end

# original webpacker:compile still gets autoloaded during bin/update
if Rake::Task.task_defined?('webpacker:compile')
  Rake::Task['webpacker:compile'].actions.clear
end

# the original webpack:compile fails to output errors, using system instead
require "webpacker/env"
require "webpacker/configuration"
namespace :webpacker do
  task :compile => ["webpacker:verify_install", :environment] do
    asset_host = ActionController::Base.helpers.compute_asset_host
    env = { "NODE_ENV" => Webpacker.env, "ASSET_HOST" => asset_host }.freeze

    system(env, './bin/webpack')

    if $?.success?
      $stdout.puts "[Webpacker] Compiled digests for all packs in #{Webpacker::Configuration.entry_path}:"
      $stdout.puts JSON.parse(File.read(Webpacker::Configuration.manifest_path))
    else
      $stderr.puts "[Webpacker] Compilation Failed"
      exit!
    end
  end
end

def asset_engines
  @asset_engines ||= begin
    require Rails.root.join("lib", "vmdb", "plugins")
    Vmdb::Plugins.asset_paths
  end
end
