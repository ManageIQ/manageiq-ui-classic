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

    # manifest_path goes to manageiq/public/manifest.json
    # packs_path goes to manageiq/public/packs/
    # output_path goes to manageiq/public/

    def source_path
      ManageIQ::UI::Classic::Engine.root.join(source)
    end
  end
end

class Webpacker::Env < Webpacker::FileLoader
  class << self
    def file_path
      ManageIQ::UI::Classic::Engine.root.join("config", "webpack", "paths.yml")
    end
  end
end

# needed when run from manageiq/
Webpacker.bootstrap if !Webpacker::Env.instance && Rails.root
