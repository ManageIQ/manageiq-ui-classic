module TreeNode
  class Classification < Node
    set_attribute(:title, &:description)
    set_attribute(:icon, "pficon pficon-folder-close")
    set_attribute(:no_click, true)
    set_attribute(:hide_checkbox, true)
    set_attribute(:tooltip) { _("Category: %{description}") % { :description => @object.description } }
  end
end
