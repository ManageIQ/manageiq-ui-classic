class TreeBuilderAutomationManagerConfiguredSystems < TreeBuilderConfiguredSystems
  private

  def root_options
    {
      :text    => t = _("All Ansible Tower Configured Systems"),
      :tooltip => t
    }
  end

  def configured_systems
    {
      :id            => "csa",
      :text          => t = _("Ansible Tower Configured Systems"),
      :icon          => "pficon pficon-folder-close",
      :tip           => t,
      :load_children => true
    }
  end

  def filter_root_class
    'ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem'
  end
end
