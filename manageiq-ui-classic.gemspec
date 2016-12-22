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
end
