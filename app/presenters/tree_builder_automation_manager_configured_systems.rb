class TreeBuilderAutomationManagerConfiguredSystems < TreeBuilderConfiguredSystems
  private

  def tree_init_options(_tree_name)
    {:leaf => "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem"}
  end

  def root_options
    {
      :title   => t = _("All Ansible Tower Configured Systems"),
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
end
