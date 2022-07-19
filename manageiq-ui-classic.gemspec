$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "manageiq/ui/classic/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "manageiq-ui-classic"
  s.version     = ManageIQ::UI::Classic::VERSION
  s.authors     = ["ManageIQ Developers"]

  s.homepage    = "https://github.com/ManageIQ/manageiq-ui-classic"
  s.summary     = "Classic UI of ManageIQ"
  s.description = "Classic UI of ManageIQ"
  s.license     = "Apache 2.0"

  s.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  s.bindir        = "exe"
  s.executables   = s.files.grep(%r{^exe/}) { |f| File.basename(f) }
  s.require_paths = ["lib"]

  s.add_dependency "rails", ">= 6.0.4", "< 7.0"

  s.add_dependency "execjs", "2.8.1" # Note: 2.8.1 requires uglifier 4.2.0 to defer uglifier asset compilation until asset compilation time: https://github.com/rails/execjs/issues/105
  s.add_dependency "high_voltage", "~> 3.0.0"
  s.add_dependency "more_core_extensions", ">= 3.2", "< 5"
  s.add_dependency "sass-rails"
  s.add_dependency "uglifier", "~>4.2.0"
  s.add_dependency "webpacker", "~>2.0.0"

  s.add_development_dependency "debride"
  s.add_development_dependency "guard-rspec", '~> 4.7.3'
  s.add_development_dependency "manageiq-style"
  s.add_development_dependency "rails-controller-testing", '~> 1.0.2'
  s.add_development_dependency "simplecov", ">= 0.21.2"

  # core because jasmine gem depends on major version only, meaning breakages when not the latest
  s.add_development_dependency "jasmine", "~> 3.4.0"
  s.add_development_dependency "jasmine-core", "~> 3.4.0"
  s.add_development_dependency "chrome_remote", "~> 0.3.0"
end
