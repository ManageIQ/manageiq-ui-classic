module TreeNode
  class Classification < Node
    set_attribute(:text, &:description)
    set_attribute(:selectable, false)
    set_attribute(:hide_checkbox, true)
    set_attribute(:tooltip) { _("Category: %{description}") % {:description => @object.description} }
  end
end
