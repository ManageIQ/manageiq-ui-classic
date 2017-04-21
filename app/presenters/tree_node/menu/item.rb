module TreeNode
  module Menu
    class Item < TreeNode::Menu::Node
      set_attribute(:key)      { "#{@options[:node_id_prefix]}__#{@object.feature}" }
      set_attribute(:title)    { _(details[:name]) }
      set_attribute(:tooltip)  { _(details[:description]) || _(details[:name]) }
      set_attribute(:selected) { @options[:features].include?(@object.feature) }

      private

      def details
        ::MiqProductFeature.obj_features[@object.feature].try(:[], :feature).try(:details)
      end
    end
  end
end
