class TreeBuilderInstancesFilter < TreeBuilderVmsFilter
  def initialize(*args)
    @root_class = 'ManageIQ::Providers::CloudManager::Vm'
    super(*args)
  end

  def root_options
    {
      :text    => _("All Instances"),
      :tooltip => _("All of the Instances that I can see")
    }
  end
end
