class TreeBuilderTemplateFilter < TreeBuilderVmsFilter
  def tree_init_options
    super.update(:leaf => 'ManageIQ::Providers::InfraManager::Template')
  end

  def root_options
    {
      :text    => _("All Templates"),
      :tooltip => _("All of the Templates that I can see")
    }
  end
end
