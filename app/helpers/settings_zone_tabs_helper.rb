module SettingsZoneTabsHelper
  def settings_zone_tab_configuration
    [:evm_servers, :smartproxy_affinity, :advanced]
  end

  def settings_zone_tab_content(key_name, &)
    if settings_zone_tabs_types[key_name]
      tag.div(:id => "settings_#{key_name}", :class => 'tab_content', &)
    end
  end

  def settings_zone_tab_index(active_tab)
    tab_name = active_tab
    return 0 unless tab_name

    # Convert "settings_evm_servers" to :evm_servers
    key = tab_name&.sub('settings_', '')&.to_sym
    settings_zone_tab_configuration.index(key) || 0
  end

  private

  def settings_zone_tabs_types
    {
      :evm_servers         => _('Zone'),
      :smartproxy_affinity => _('SmartProxy Affinity'),
      :advanced            => _('Advanced'),
    }
  end
end
