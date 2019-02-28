class TreeBuilderInstancesFilter < TreeBuilderVmsFilter
  def tree_init_options
    super.update(:leaf => 'ManageIQ::Providers::CloudManager::Vm')
  end

  def root_options
    {
      :text    => _("All Instances"),
      :tooltip => _("All of the Instances that I can see")
    }
  end
end
