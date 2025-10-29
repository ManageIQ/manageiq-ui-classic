require "manageiq/ui/classic/engine"
require "manageiq/ui/classic/version"
require "extensions/ac_nested_params"

module ManageIQ
  module UI
    module Classic
      def self.root
        Engine.root
      end
    end
  end
end
