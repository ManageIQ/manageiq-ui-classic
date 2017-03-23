module Quadicons
  module Quadrants
    class GuestState < Quadrants::Base
      def path
        "svg/currentstate-#{state}.svg"
      end

      def state
        h(record.try(:normalized_state).try(:downcase))
      end

      private

      def default_tag_classes
        ["quadicon-quadrant", "guest_state-#{state}"] << css_class
      end
    end
  end
end
