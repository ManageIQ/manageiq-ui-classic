# This is loaded once before the first command is executed

begin
  require 'database_cleaner-active_record'
rescue LoadError => e
  puts e.message
  begin
    require 'database_cleaner'
  rescue LoadError => e
    puts e.message
  end
end

begin
  require 'factory_bot_rails'
rescue LoadError => e
  puts e.message
  begin
    require 'factory_girl_rails'
  rescue LoadError => e
    puts e.message
  end
end

require 'cypress_on_rails/smart_factory_wrapper'

factory = CypressOnRails::SimpleRailsFactory
factory = FactoryBot if defined?(FactoryBot)
factory = FactoryGirl if defined?(FactoryGirl)

# TODO: By default, Factory bot sets definition_file_paths to directories to search for factories:
# https://github.com/thoughtbot/factory_bot/blob/8446cb6c5b39ea046d8ba180197aabc66adf62ed/lib/factory_bot/find_definitions.rb#L10
# Cypress on rails SmartFactoryWrapper is expecting files to be a pattern or a file that when evaluated with Dir[xxx],
# will return files, not a directory:
# https://github.com/shakacode/cypress-playwright-on-rails/blob/abb505c0691c29d5f2a57c2ba28aedbfd43d079e/lib/cypress_on_rails/smart_factory_wrapper.rb#L88
# Therefore, to reuse the existing definition_file_paths, we must convert the directories to glob pattern matches.
require Rails.root.join('spec/support/factory_bot_helper')
CypressOnRails::SmartFactoryWrapper.configure(
  always_reload: false,
  factory: factory,
  files: FactoryBot.definition_file_paths.flat_map { |p| p.directory? ? p.join("**/*.rb") : p }
)
