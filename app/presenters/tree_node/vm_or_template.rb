module TreeNode
  class VmOrTemplate < Node
    set_attribute(:icon) { QuadiconHelper.machine_state(@object.normalized_state)[:fonticon] }

    set_attribute(:tooltip) do
      unless @object.template?
        _("VM: %{name} (Click to view)") % {:name => @object.name}
      end
    end
  end
end
