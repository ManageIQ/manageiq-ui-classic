class TreeBuilderAutomationManagerConfiguredSystems < TreeBuilderConfiguredSystems
  def initialize(*args)
    @root_class = 'ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem'
    super(*args)
  end

  private

  def root_options
    {
      :text    => t = _("All Ansible Tower Configured Systems"),
      :tooltip => t
    }
  end

  def configured_systems
    {
      :id   => "csa",
      :text => t = _("Ansible Tower Configured Systems"),
      :icon => "pficon pficon-folder-close",
      :tip  => t
    }
  end
end
