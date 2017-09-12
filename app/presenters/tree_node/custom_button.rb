module TreeNode
  class CustomButton < Node
    set_attribute(:tooltip) { _("Button: %{button_description}") % {:button_description => @object.description} }
    set_attribute(:color) { @object.options.key?(:button_color) ? @object.options[:button_color] : nil }
  end
end
