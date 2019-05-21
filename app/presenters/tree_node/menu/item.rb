module TreeNode
  module Menu
    class Item < TreeNode::Menu::Node
      set_attribute(:key) { "#{@tree.node_id_prefix}__#{@object.feature}" }
      set_attribute(:text) { _(details[:name]) }
      set_attribute(:tooltip) { _(details[:description]) || _(details[:name]) }
      set_attribute(:selected) { parent_selected? || self_selected? }

      private

      def details
        ::MiqProductFeature.obj_features[@object.feature].try(:[], :feature).try(:details)
      end

      def feature_parent
        ::MiqProductFeature.obj_features[::MiqProductFeature.feature_parent(@object.feature)][:feature]
      end

      def parent_selected?
        @tree.features.include?(feature_parent.identifier)
      end

      def self_selected?
        @tree.features.include?(@object.feature)
      end
    end
  end
end
