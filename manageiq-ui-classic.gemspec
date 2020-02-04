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

  s.add_dependency "rails", ">= 5.0.0.1", "< 5.3"

  s.add_dependency "coffee-rails"
  s.add_dependency "font-fabulous", "~> 1.0.5"
  s.add_dependency "high_voltage", "~> 3.0.0"
  s.add_dependency "more_core_extensions", "~>3.2"
  s.add_dependency "novnc-rails", "~>0.2"
  s.add_dependency "patternfly-sass", "~> 3.59.1"
  s.add_dependency "sass-rails"
  s.add_dependency "uglifier", "~>3.0.0"
  s.add_dependency "webpacker", "~>2.0.0"

  s.add_development_dependency "guard-rspec", '~> 4.7.3'
  s.add_development_dependency "rails-controller-testing", '~> 1.0.2'
  s.add_development_dependency "simplecov"
  s.add_development_dependency "coveralls", '~> 0.8.23'
  s.add_dependency "coveralls", '~> 0.8.23'

  # core because jasmine gem depends on major version only, meaning breakages when not the latest
  s.add_development_dependency "jasmine", "~> 3.4.0"
  s.add_development_dependency "jasmine-core", "~> 3.4.0"
  s.add_development_dependency "chrome_remote", "~> 0.2.0"
end
