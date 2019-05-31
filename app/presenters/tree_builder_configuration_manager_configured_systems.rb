class TreeBuilderConfigurationManagerConfiguredSystems < TreeBuilderConfiguredSystems
  private

  def root_options
    {
      :text    => t = _("All Configured Systems"),
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

  def filter_root_class
    'ManageIQ::Providers::Foreman::ConfigurationManager::ConfiguredSystem'
  end
end
