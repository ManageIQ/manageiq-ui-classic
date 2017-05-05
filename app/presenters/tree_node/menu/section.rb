module TreeNode
  module Menu
    class Section < TreeNode::Menu::Node
      set_attribute(:key)      { "#{@options[:node_id_prefix]}___tab_#{@object.id}" }
      set_attribute(:title)    { _(@object.name) }
      set_attribute(:tooltip)  { _("%{title} Main Tab") % {:title => @object.name} }
    end
  end
end
