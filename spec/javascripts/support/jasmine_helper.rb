# Use this file to set/override Jasmine configuration options
# You can remove it if you don't need it.
# This file is loaded *after* jasmine.yml is interpreted.
#
Jasmine.configure do |config|
  # The gemified version of Jasmine uses the gemified version of PhantomJS
  # which auto-installs it if it can't find your installation in ~/.phantomjs
  # Travis already has a version of PhantomJS installed in a different
  # location, so the gem will auto-install even if it's pointless.  Also,
  # gemified PhantomJS hardcodes install URLs from BitBucket which times out
  # and causes failed builds.
  #
  # TLDR: Don't install auto-install PhantomJS on CI. In Travis we trust.
  config.prevent_phantom_js_auto_install = true if ENV['CI']

  bak = config.runner
  config.runner = lambda do |formatter, jasmine_server_url|
    p [:RUNNER, formatter, jasmine_server_url]
    bak.call(formatter, jasmine_server_url).tap do |ret|
      p [:RET, ret]
    end
  end
end

module Jasmine
   class << self
     alias_method :wait_for_listener_bak, :wait_for_listener
   end

  def self.wait_for_listener(*args)
    puts "wrap wait_for_listener"
    self.wait_for_listener_bak(*args)
    puts "done, wait"
    sleep 1
    puts "end wait"
  end
end


module Jasmine
  module Runners
    class PhantomJs
      alias_method :run_bak, :run

      def run
        p [:RUN, jasmine_server_url]

        system("phantomjs --version")

        phantom_script = File.join(File.dirname(__FILE__), 'phantom_jasmine_run.js')
        command = "\"#{phantom_js_path}\" \"#{phantom_script}\" \"#{jasmine_server_url}\" \"#{show_console_log}\" \"#{@phantom_config_script}\""
        run_details = { 'random' => false }

        IO.popen(command) do |output|
          p [:IO, output]
          output.each do |line|
            p [:X, line]
          end
          output.each_line do |line|
            p [:Y, line]
          end
        end

        run_bak.tap do |ret|
          p [:RUN_BAK, 'done']
        end
      end
    end
  end
end
