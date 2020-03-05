class TreeBuilderConfigurationManagerConfiguredSystems < TreeBuilderConfiguredSystems
  def initialize(*args)
    @root_class = 'ConfiguredSystem'
    super(*args)
  end

  private

  def root_options
    {
      :text    => t = _("All Configured Systems"),
      :tooltip => t
    }
  end

  def configured_systems
    {
      :id   => "csf",
      :text => t = _("%{name} Configured Systems") % {:name => ui_lookup(:ui_title => 'foreman')},
      :icon => "pficon pficon-folder-close",
      :tip  => t
    }
  end
end
