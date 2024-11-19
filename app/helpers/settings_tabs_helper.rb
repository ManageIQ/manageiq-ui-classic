module SettingsTabsHelper
  SETTINGS_TAB_IDS = %w[
    settings_details
    settings_cu_collection
    settings_tags
    settings_replication
    settings_help_menu
    settings_advanced
  ]

  def settings_tab_configuration
    [:details, :cu_collection, :tags, :replication, :help_menu, :advanced]
  end

  def settings_tab_content(key_name, &block)
    if settings_tabs_types[key_name]
      tag.div(:id => "settings_#{key_name}", :class => 'tab_content', &block)
    end
  end

def settings_tab_index_by_name(name)
  [SETTINGS_TAB_IDS.index(name) || -1, SETTINGS_TAB_IDS.length]
end

  private

  def settings_tabs_types
    {
      :details       => _('Details'),
      :cu_collection => _('C & U Collection'),
      :tags          => _('Tags'),
      :replication   => _('Replication'),
      :help_menu     => _('Help Menu'),
      :advanced      => _('Advanced'),
    }
  end
end
