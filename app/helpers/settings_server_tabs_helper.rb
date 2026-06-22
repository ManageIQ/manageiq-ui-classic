module SettingsServerTabsHelper
  def settings_server_tab_configuration(cur_svr_id, my_svr_id, is_podified)
    tabs = [:server, :authentication, :workers]
    tabs << :custom_logos if cur_svr_id == my_svr_id && !is_podified
    tabs << :advanced
    tabs
  end

  def settings_server_tab_content(key_name, &)
    if settings_server_tabs_types[key_name]
      tag.div(:id => "settings_#{key_name}", :class => 'tab_content', &)
    end
  end

  def settings_server_tab_index(active_tab, cur_svr_id, my_svr_id, is_podified)
    return 0 unless active_tab

    # Convert "settings_server" to :server
    key = active_tab.sub('settings_', '').to_sym

    # Get the current configuration based on server settings
    tabs = settings_server_tab_configuration(cur_svr_id, my_svr_id, is_podified)

    tabs.index(key) || 0
  end

  private

  def settings_server_tabs_types
    {
      :server         => _('Server'),
      :authentication => _('Authentication'),
      :workers        => _('Workers'),
      :custom_logos   => _('Custom Logos'),
      :advanced       => _('Advanced'),
    }
  end
end
