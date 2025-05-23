class TreeBuilderAutomationManagerConfiguredSystems < TreeBuilderConfiguredSystems
  def initialize(*args)
    @root_class = 'ManageIQ::Providers::AutomationManager::ConfiguredSystem'
    super(*args)
  end

  private

  def root_options
    {
      :text    => t = _("All Automation Configured Systems"),
      :tooltip => t
    }
  end

  def configured_systems
    {
      :id   => "csa",
      :text => t = _("Automation Configured Systems"),
      :icon => "pficon pficon-folder-close",
      :tip  => t
    }
  end
end
