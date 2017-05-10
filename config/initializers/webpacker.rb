# override defaults which use Rails.root
require 'webpacker'

class Webpacker::Configuration
  class << self
    def config_path
      ManageIQ::UI::Classic::Engine.root.join(paths.fetch(:config, "config/webpack"))
    end

    def entry_path
      ManageIQ::UI::Classic::Engine.root.join(source_path, paths.fetch(:entry, "packs"))
    end

    def file_path
      ManageIQ::UI::Classic::Engine.root.join("config", "webpack", "paths.yml")
    end

    def manifest_path
      ManageIQ::UI::Classic::Engine.root.join(output_path, "manifest.json")
    end

    def packs_path
      ManageIQ::UI::Classic::Engine.root.join(output_path, paths.fetch(:entry, "packs"))
    end

    # output_path does go to manageiq/

    def source_path
      ManageIQ::UI::Classic::Engine.root.join(source)
    end
  end
end
