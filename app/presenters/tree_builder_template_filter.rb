class TreeBuilderTemplateFilter < TreeBuilderVmsFilter
  private

  def root_options
    {
      :text    => _("All Templates"),
      :tooltip => _("All of the Templates that I can see")
    }
  end

  def filter_root_class
    'ManageIQ::Providers::InfraManager::Template'
  end
end
