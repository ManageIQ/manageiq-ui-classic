module DiagnosticsTabsHelper
  # Zone-level diagnostics tabs configuration
  def diagnostics_zone_tab_configuration
    [:roles_servers, :servers_roles, :server_list, :cu_repair]
  end

  def diagnostics_zone_tab_content(key_name, active_tab: nil, &)
    if diagnostics_zone_tabs_types[key_name]
      # Add 'active' class if this is the currently active tab
      css_class = 'tab-pane tab_content'
      css_class += ' active' if active_tab == "diagnostics_#{key_name}"
      tag.div(:id => "diagnostics_zone_#{key_name}", :class => css_class, &)
    end
  end

  def diagnostics_zone_tab_index(active_tab)
    return 0 unless active_tab

    # Convert "diagnostics_roles_servers" to :roles_servers
    key = active_tab.sub('diagnostics_', '').to_sym

    tabs = diagnostics_zone_tab_configuration
    tabs.index(key) || 0
  end

  # Server-level diagnostics tabs configuration
  def diagnostics_server_tab_configuration(selected_server_id, my_server_id, server_started, is_podified)
    tabs = []

    # Summary and Workers tabs shown if it's my server or server is started
    if selected_server_id == my_server_id || server_started
      tabs << :summary
      tabs << :workers
    end

    # Log tabs only shown for my server and not podified
    if selected_server_id == my_server_id && !is_podified
      tabs << :evm_log
      tabs << :audit_log
      tabs << :production_log
    end

    tabs
  end

  def diagnostics_server_tab_content(key_name, active_tab: nil, &)
    if diagnostics_server_tabs_types[key_name]
      # Add 'active' class if this is the currently active tab
      css_class = 'tab-pane tab_content'
      css_class += ' active' if active_tab == "diagnostics_#{key_name}"
      tag.div(:id => "diagnostics_#{key_name}", :class => css_class, &)
    end
  end

  def diagnostics_server_tab_index(active_tab, selected_server_id, my_server_id, server_started, is_podified)
    return 0 unless active_tab

    # Convert "diagnostics_summary" to :summary
    key = active_tab.sub('diagnostics_', '').to_sym

    tabs = diagnostics_server_tab_configuration(selected_server_id, my_server_id, server_started, is_podified)
    tabs.index(key) || 0
  end

  # Root-level diagnostics tabs configuration
  def diagnostics_root_tab_configuration(is_super_admin)
    tabs = [:zones]

    if is_super_admin
      tabs << :roles_servers
      tabs << :servers_roles
    end

    tabs << :server_list

    tabs << :database if is_super_admin

    tabs
  end

  def diagnostics_root_tab_content(key_name, active_tab: nil, &)
    if diagnostics_root_tabs_types[key_name]
      # Add 'active' class if this is the currently active tab
      css_class = 'tab-pane tab_content'
      css_class += ' active' if active_tab == "diagnostics_#{key_name}"
      tag.div(:id => "diagnostics_#{key_name}", :class => css_class, &)
    end
  end

  def diagnostics_root_tab_index(active_tab, is_super_admin)
    return 0 unless active_tab

    # Convert "diagnostics_zones" to :zones
    key = active_tab.sub('diagnostics_', '').to_sym

    tabs = diagnostics_root_tab_configuration(is_super_admin)
    tabs.index(key) || 0
  end

  private

  def diagnostics_zone_tabs_types
    {
      :roles_servers => _('Roles by Servers'),
      :servers_roles => _('Servers by Roles'),
      :server_list   => _('Servers'),
      :cu_repair     => _('C & U Gap Collection'),
    }
  end

  def diagnostics_server_tabs_types
    {
      :summary        => _('Summary'),
      :workers        => _('Workers'),
      :evm_log        => _('%{product} Log') % {:product => Vmdb::Appliance.PRODUCT_NAME},
      :audit_log      => _('Audit Log'),
      :production_log => _('Production Log'),
    }
  end

  def diagnostics_root_tabs_types
    {
      :zones         => _('Zones'),
      :roles_servers => _('Roles by Servers'),
      :servers_roles => _('Servers by Roles'),
      :server_list   => _('Servers'),
      :database      => _('Database'),
    }
  end
end
