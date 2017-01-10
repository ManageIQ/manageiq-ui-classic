class TreeBuilderVmsInstancesFilter < TreeBuilderVmsFilter
  def tree_init_options(_tree_name)
    super.update(:leaf => 'Vm')
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:tree_id => "vms_instances_filter_treebox", :tree_name => "vms_instances_filter_tree")
  end

  def root_options
    {
      :title   => _("All VMs & Instances"),
      :tooltip => _("All of the VMs & Instances that I can see")
    }
  end
end
