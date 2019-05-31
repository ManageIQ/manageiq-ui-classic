class TreeBuilderVmsInstancesFilter < TreeBuilderVmsFilter
  private

  def root_options
    {
      :text    => _("All VMs & Instances"),
      :tooltip => _("All of the VMs & Instances that I can see")
    }
  end

  def filter_root_class
    'Vm'
  end
end
