module TreeNode
  class CustomButton < Node
    set_attribute(:icon) do
      @object.options && @object.options[:button_image] ? "product product-custom-#{@object.options[:button_image]}" : 'fa fa-file-o'
    end

    set_attribute(:tooltip) { _("Button: %{button_description}") % {:button_description => @object.description} }
  end
end
