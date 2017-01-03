module TreeNode
  module Menu
    class Item < TreeNode::Menu::Node
      set_attribute(:key)      { "#{@options[:node_id_prefix]}__#{@object.feature}" }
      set_attribute(:title)    { _(details[:name]) }
      set_attribute(:tooltip)  { _(details[:description]) || _(details[:name]) }
      set_attribute(:selected) { self_selected? || select_by_children_selected }

      def children
        @children ||= begin
          if feature
            feature.children.flat_map do |child|
              TreeNode::MiqProductFeature.new(child, key, @options)
            end
          else
            []
          end
        end
      end

      def self_selected?
        @options[:features].include?(@object.feature)
      end

      private

      def feature
        ::MiqProductFeature.obj_features[@object.feature].try(:[], :feature)
      end

      def details
        feature.details
      end
    end
  end
end
