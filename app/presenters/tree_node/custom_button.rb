module TreeNode
  class CustomButton < Node
    set_attribute(:tooltip) { _("Button: %{button_description}") % {:button_description => @object.description} }
  end
end
