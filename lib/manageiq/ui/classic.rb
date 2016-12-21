require "manageiq/ui/classic/engine"
require "manageiq/ui/classic/version"

module ManageIQ
  module UI
    module Classic
      def self.root
        Engine.root
      end
    end
  end
end
