class TreeBuilderTemplateFilter < TreeBuilderVmsFilter
  def initialize(*args)
    @root_class = 'ManageIQ::Providers::InfraManager::Template'
    super(*args)
  end

  def root_options
    {
      :text    => _("All Templates"),
      :tooltip => _("All of the Templates that I can see")
    }
  end
end
