module Quadicons
  module Quadrants
    class NormalizedState < Quadrants::Base
      def render
        quadrant_tag do
          render_strategy
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

      def render_strategy
        if state == "archived"
          content_tag(:span, "A", :class => "quadrant-value")
        else
          image_tag(path)
        end
      end
    end
  end
end
