gemspec

#
# Custom Gemfile modifications
#

# Load developer specific Gemfile
#   Developers can create a file called Gemfile.dev.rb containing any gems for
#   their local development.  This can be any gem under evaluation that other
#   developers may not need or may not easily install, such as rails-dev-boost,
#   any git based gem, and compiled gems like rbtrace or memprof.
dev_gemfile = File.expand_path("Gemfile.dev.rb", __dir__)
eval_gemfile(dev_gemfile) if File.exist?(dev_gemfile)

manageiq_gemfile = File.realpath("spec/manageiq/Gemfile", __dir__)
if File.exist?(manageiq_gemfile)
  eval_gemfile(manageiq_gemfile)
else
  puts "ERROR: The ManageIQ application must be present in spec/manageiq."
  puts "  Clone it from GitHub or symlink it from local source."
  exit 1
end
