module OpsHelper::SettingsZoneHelper
  private

  def settings_zone_summary(sb_data, servers, selected_zone)
    if sb_data[:active_tab] == "settings_evm_servers" && servers
      summary = [settings_zone_basic_info(selected_zone)]
      summary.push(settings_zone_relationships(selected_zone))
      summary.push(settings_zone_servers(servers))
      safe_join(summary)
    end
  end

  def settings_zone_basic_info(selected_zone)
    rows = [
      row_data(_('Name'), selected_zone.name),
      row_data(_('Description'), selected_zone.description),
      row_data(_('SmartProxy Server IP'), selected_zone.settings.key?("proxy_server_ip") ? selected_zone.settings["proxy_server_ip"] : ''),
      row_data(_('Max active VM Scans'), selected_zone.settings.key?("concurrent_vm_scans") && selected_zone.settings["concurrent_vm_scans"].to_i > 0 ? selected_zone.settings["concurrent_vm_scans"] : _("Unlimited"))
    ]
    miq_structured_list({
                          :title => _('Basic Information'),
                          :mode  => "settings_zone_basic_info",
                          :rows  => rows
                        })
  end

  def settings_zone_relationships(selected_zone)
    rows = [
      row_data(_('Servers'), selected_zone.miq_servers.count),
      row_data(_('Providers'), selected_zone.ext_management_systems.count),
      row_data(_('Schedules'), selected_zone.miq_schedules.count)
    ]
    miq_structured_list({
                          :title => _('Relationships'),
                          :mode  => "settings_zone_relationships",
                          :rows  => rows
                        })
  end

  def settings_zone_server_name(server)
    name = "#{ui_lookup(:model => server.class.to_s)} : #{h(server.name)}//[#{h(server.id)}]"
    my_server.id == server.id ? "#{name}#{_('(current)')}" : name.to_s
  end

  def settings_zone_cell_onclick(node_key)
    {
      :remote => true,
      :action => {
        :name     => "miqTreeActivateNode",
        :nodeTree => "settings_tree",
        :nodeKey  => node_key
      }
    }
  end

  def settings_zone_servers(servers)
    data = {
      :title => _('Servers'),
      :mode  => "settings_zone_servers",
      :rows  => []
    }
    if servers.empty?
      data[:message] = _("No Servers Found.")
    else
      data[:rows] = servers.sort_by(&:id).map do |server|
        {
          :cells   => [
            :icon  => server.decorate.fonticon,
            :value => settings_zone_server_name(server)
          ],
          :onclick => settings_zone_cell_onclick("svr-#{server.id}"),
          :title   => _("View this MiqServer")
        }
      end
    end
    miq_structured_list(data)
  end
end
