module TreeNode
  module Menu
    class Item < TreeNode::Menu::Node
      set_attribute(:key) { "#{@tree.node_id_prefix}__#{@object.feature}" }

      set_attributes(:text, :tooltip) do
        details = ::MiqProductFeature.obj_features[@object.feature].try(:[], :feature).try(:details)
        [_(details[:name]), _(details[:description]) || _(details[:name])]
      end

      set_attribute(:selected) do
        parent_feature = ::MiqProductFeature.obj_features[::MiqProductFeature.feature_parent(@object.feature)][:feature]

        [parent_feature.identifier, @object.feature].any? do |item|
          @tree.features.include?(item)
        end
      end
    end
  end
end
