require "manageiq/ui/classic/engine"

module ManageIQ
  module UI
    module Classic
      def self.root
        Engine.root
      end

      def self.spec_root
        root.join('spec')
      end

      def self.rspec_paths
        dirs = [
          spec_root.join('controllers'),
          spec_root.join('helpers'),
          spec_root.join('lib'),
          spec_root.join('presenters'),
          spec_root.join('views')
        ].map{ |d| d.join('**', '*_spec.rb') }

        FileList.new(dirs)
      end
    end
  end
end
