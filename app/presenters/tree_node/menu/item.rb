module TreeNode
  module Menu
    class Item < TreeNode::Menu::Node
      set_attribute(:key) { "#{@options[:node_id_prefix]}__#{@object.feature}" }
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
        @options[:features].include?(feature_parent.identifier)
      end

      def self_selected?
        @options[:features].include?(@object.feature)
      end
    end
  end
end
