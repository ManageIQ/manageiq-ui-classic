module TreeNode
  module Menu
    class Node < TreeNode::Node
      set_attribute(:no_click, true)
      set_attribute(:icon, "pficon pficon-folder-close")

      set_attribute(:checkable) { @options[:editable] }

      def self_and_child_states
        child_states.unshift(selected)
      end

      private

      def child_states
        @states ||= children.flat_map(&:self_and_child_states)
      end

      def select_by_children_selected
        return false       if children.empty?
        return true        if child_states.all? { |s| s == true } # true not just truthy
        return 'undefined' if child_states.any?

        false
      end
    end
  end
end
