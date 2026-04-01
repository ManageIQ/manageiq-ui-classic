# frozen_string_literal: true

# Helper module to check Node.js version before running operations
module NodeVersionCheck
  def self.verify!
    gem_root = defined?(APP_PATH) ? APP_PATH : File.expand_path("..", __dir__)
    version_check_script = File.join(gem_root, "scripts/check-node-version.js")

    unless system("node", version_check_script)
      # rubocop:disable Rails/Exit
      exit 1
      # rubocop:enable Rails/Exit
    end
  end
end
