module TreeNode
  class VmOrTemplate < Node
    set_attributes(:image, :icon) do
      if @object.normalized_state.downcase == 'archived'
        icon = "fa fa-archive"
      else
        image = "svg/currentstate-#{@object.normalized_state.downcase}.svg"
      end
      [image, icon]
    end

    set_attribute(:tooltip) do
      unless @object.template?
        _("VM: %{name} (Click to view)") % {:name => @object.name}
      end
    end
  end
end
