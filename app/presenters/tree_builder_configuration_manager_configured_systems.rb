class TreeBuilderConfigurationManagerConfiguredSystems < TreeBuilderConfiguredSystems
  private

  def tree_init_options(_tree_name)
    {:leaf => "ManageIQ::Providers::ForemanProvider::ConfigurationManager::ConfiguredSystem"}
  end

  def root_options
    {
      :title   => t = _("All Configured Systems"),
      :tooltip => t
    }
  end

  def configured_systems
    {
      :id            => "csf",
      :text          => t = _("%{name} Configured Systems") % {:name => ui_lookup(:ui_title => 'foreman')},
      :icon          => "pficon pficon-folder-close",
      :tip           => t,
      :load_children => true
    }
  end
end
