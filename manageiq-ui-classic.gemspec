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

  s.add_dependency "rails", "~> 5.0.0", ">= 5.0.0.1"

  s.add_dependency "coffee-rails"
  s.add_dependency "jquery-hotkeys-rails"
  s.add_dependency "lodash-rails", "~>3.10.0"
  s.add_dependency "patternfly-sass", "~> 3.23.1"
  s.add_dependency "sass-rails"
  s.add_dependency "high_voltage", "~> 3.0.0"

  s.add_development_dependency "codeclimate-test-reporter", "~> 1.0.0"
  s.add_development_dependency "guard-rspec", '~> 4.7.3'
  s.add_development_dependency "simplecov"

  # core because jasmine has < 3.0, not < 2.6
  s.add_development_dependency "jasmine",  "~> 2.5.2"
  s.add_development_dependency "jasmine-core",  "~> 2.5.2"
end
