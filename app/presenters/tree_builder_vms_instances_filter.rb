class TreeBuilderVmsInstancesFilter < TreeBuilderVmsFilter
  def initialize(*args)
    @root_class = 'Vm'
    super(*args)
  end

  def root_options
    {
      :text    => _("All VMs & Instances"),
      :tooltip => _("All of the VMs & Instances that I can see")
    }
  end
end
