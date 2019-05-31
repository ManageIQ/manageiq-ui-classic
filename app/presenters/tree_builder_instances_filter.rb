class TreeBuilderInstancesFilter < TreeBuilderVmsFilter
  private

  def root_options
    {
      :text    => _("All Instances"),
      :tooltip => _("All of the Instances that I can see")
    }
  end

  def filter_root_class
    'ManageIQ::Providers::CloudManager::Vm'
  end
end
