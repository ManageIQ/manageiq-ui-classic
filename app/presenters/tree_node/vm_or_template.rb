module TreeNode
  class VmOrTemplate < Node
    set_attributes(:icon, :icon_background) do
      QuadiconHelper.machine_state(@object.normalized_state).values_at(:fonticon, :background)
    end

    set_attribute(:color, '#fff')

    set_attribute(:tooltip) do
      unless @object.template?
        _("VM: %{name} (Click to view)") % {:name => @object.name}
      end
    end
  end
end
