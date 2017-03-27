module Quadicons
  module Quadrants
    class HostVendor < Quadrants::Base
      def path
        "svg/vendor-#{vendor}.svg"
      end

      def vendor
        name = record.try(:vendor).try(:downcase) || "unknown"
        h(name)
      end
    end
  end
end
