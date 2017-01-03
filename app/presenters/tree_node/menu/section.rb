module TreeNode
  module Menu
    class Section < TreeNode::Menu::Node
      set_attribute(:key)      { "#{@options[:node_id_prefix]}___tab_#{@object.id}" }
      set_attribute(:title)    { _(@object.name) }
      set_attribute(:tooltip)  { _("%{title} Main Tab") % {:title => @object.name} }
      set_attribute(:selected) { select_by_children_selected }

      def children
        @children ||= begin
          @object.items.flat_map do |item|
            node = TreeNode.new(item, nil, @options)
            [node].concat(node.children)
          end
        end
      end
    end
  end
end
