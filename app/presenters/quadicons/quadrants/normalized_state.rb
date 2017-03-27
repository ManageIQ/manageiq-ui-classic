module Quadicons
  module Quadrants
    class NormalizedState < Quadrants::Base
      def render
        quadrant_tag do
          image_tag(path)
        end
      end

      def path
        "svg/currentstate-#{state}.svg"
      end

      def state
        h(record.try(:normalized_state).try(:downcase))
      end

      private

      def default_tag_classes
        ["quadicon-quadrant", css_class, "normalized_state-#{state}"]
      end
    end
  end
end
