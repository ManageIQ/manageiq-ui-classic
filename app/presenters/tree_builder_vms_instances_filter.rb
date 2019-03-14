class TreeBuilderVmsInstancesFilter < TreeBuilderVmsFilter
  def tree_init_options
    super.update(:leaf => 'Vm')
  end

  def root_options
    {
      :text    => _("All VMs & Instances"),
      :tooltip => _("All of the VMs & Instances that I can see")
    }
  end
end
