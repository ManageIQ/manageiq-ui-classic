module OpsHelper
  include_concern 'TextualSummary'
  include_concern 'MyServer'
  include VmwareConsoleHelper
  include SettingsAnalysisProfileHelper

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end

  def database_details
    @database_details = ActiveRecord::Base.configurations[Rails.env]
    @database_display_name =
      if @database_details["host"].in?([nil, "", "localhost", "127.0.0.1"])
        _("Internal Database")
      else
        _("External Database")
      end
      @data = {:title => _('Basic Information')}
      @data[:rows] = [
        row_data(_('Name'), @database_display_name),
        row_data(_('Hostname'), @database_details["host"]),
        row_data(_('Database name'), @database_details["database"]),
        row_data(_('Username'), @database_details["username"])
      ]
  end

  def database_tab_summary
    miq_structured_list(@data)
  end

  def collect_logs_tab
    record = @selected_server
    log_depot_uri = (record.log_file_depot.try(:uri) || "N/A").to_s
    last_time = record.last_log_sync_on
    last_collection_time = last_time.blank? ? _("Never") : format_timezone(last_time.to_time, Time.zone, "gtl")
    data = {:title => _('Basic Information'), :mode => "miq_summary"}
    data[:rows] = [
      row_data(_('Log Depot URI'), log_depot_uri),
      row_data(_('Last Log Collection'), last_collection_time)
    ]
    if record.respond_to?(:last_log_sync_message)
      data[:rows] = [
        row_data(_('Log Depot URI'), log_depot_uri),
        row_data(_('Last Log Collection'), last_collection_time),
        row_data(_('Last Message'), record.last_log_sync_message)
      ]
    end
    miq_structured_list(data)
  end

  def hide_button(button, opt)
    if opt == "on"
      button ? '' : 'display:none'
    else
      button ? 'display:none' : ''
    end
  end

  def selected_settings_tree?(tree_node)
    tree_keys = tree_node.split("-")
    # only 'root' key has 1 key after split
    if tree_keys.count == 2
      tree_keys.any? { |t_key| %w[msc sis z l ld lr].include?(t_key) }
    else
      false
    end
  end

  def selected?(tree_node, key)
    tree_node.split('-').first == key
  end

  def advanced_tab_warning
    if selected?(x_node, "svr")
      _('Caution: Manual changes to configuration files can disable the Server!') + " " +
        _('Changes made to any individual settings will overwrite settings inherited from the Zone!')
    elsif selected?(x_node, "z")
      _('Caution: Manual changes to configuration files can disable the Zone!') + " " +
        _('Changes made to any individual settings will overwrite settings inherited from the Region!')
    else
      _('Caution: Manual changes to configuration files can disable the Region!') + " " +
        _('Changes made to any individual settings will overwrite settings inherited from the template!')
    end
  end

  def advanced_tab_info
    if selected?(x_node, "svr")
      _('To reset back to the Zone\'s setting or to delete a setting, set the value to <<reset>>.')
    elsif selected?(x_node, "z")
      _('To reset back to the Regions\'s setting or to delete a setting, set the value to <<reset>>.')
    else
      _('To reset back to the template\'s setting or to delete a setting, set the value to <<reset>>.')
    end
  end

  def auth_mode_name
    case ::Settings.authentication.mode.downcase
    when 'amazon'
      _('Amazon')
    when 'httpd'
      _('External Authentication')
    when 'database'
      _('Database')
    end
  end

  def server_zones
    @server_zones ||= Zone.visible.in_my_region.pluck(:name)
  end

  def server_zone_title_text
    _("The server zone cannot be changed when running in containers") if server_zones.length > 1 && !MiqServer.zone_is_modifiable?
  end

  def miq_summary_rbac_details(users, groups, roles, tenants)
    data = {:title => _("Access control"), :mode => "miq_access_control"}
    rows = []
    if role_allows?(:feature => "rbac_user_view", :any => true)
      rows.push({
                  :cells   => [{:icon => "pficon pficon-user", :value => _("Users (%{users_count})") % {:users_count => users.to_s}}],
                  :title   => _("View Users"),
                  :onclick => "miqTreeActivateNode('rbac_tree', 'xx-u');"
                })
    end
    if role_allows?(:feature => "rbac_group_view", :any => true)
      rows.push({
                  :cells   => [{:icon => "ff ff-group", :value => _("Groups (%{groups_count})") % {:groups_count => groups.to_s}}],
                  :title   => _("View Groups"),
                  :onclick => "miqTreeActivateNode('rbac_tree', 'xx-g');"
                })
    end
    if role_allows?(:feature => "rbac_role_view", :any => true)
      rows.push({
                  :cells   => [{:icon => "ff ff-user-role", :value => _("Roles (%{roles_count})") % {:roles_count => roles.to_s}}],
                  :title   => _("View Roles"),
                  :onclick => "miqTreeActivateNode('rbac_tree', 'xx-ur');"
                })
    end
    if role_allows?(:feature => "rbac_tenant_view", :any => true)
      rows.push({
                  :cells   => [{:icon => "pficon pficon-tenant", :value => _("Tenants (%{tenants_count})") % {:tenants_count => tenants.to_s}}],
                  :title   => _("View Tenants"),
                  :onclick => "miqTreeActivateNode('rbac_tree', 'xx-tn');"
                })
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def select_by_servers(record)
    if record.instance_of?(MiqServer)
      select_server_details(record)
    else
      data = {:mode => "selected_server_role_details"}
      rows = [
        {:cells => [{:icon => "ff ff-user-role settings-icn"}]},
        row_data(_('Role'), "#{record.server_role.description} on Server: #{record.miq_server.name} [#{record.miq_server.id}]")
      ]
      status = _("unavailable")
      if record.miq_server.started?
        status = record.active ? _("active") : _("available")
      end
      rows.push(row_data(_('Status'), status))
      priority = server_priority(record)
      rows.push(row_data(_('Priority'), priority))

      max = record.server_role.max_concurrent
      rows.push(row_data(_('Max Concurrent'), max == 0 ? _("unlimited") : max))

      data[:rows] = rows
      miq_structured_list(data)
    end
  end

  def select_by_roles(record)
    if record.instance_of?(ServerRole)
      data = {:mode => "selected_server_by_role_details"}
      rows = [{:cells => [{:icon => "ff ff-user-role settings-icn"}]},
              row_data(_('Role'), record.description)]
      status = record.assigned_server_roles.find_by(:active => true) ? "active" : "stopped"
      rows.push(row_data(_('Status'), status))
      max = record.max_concurrent
      rows.push(row_data(_('Max Concurrent'), max == 0 ? _("unlimited") : max))

      data[:rows] = rows
      miq_structured_list(data)
    else
      select_server_details(record.miq_server, record)
    end
  end

  def select_server_details(record, role = nil)
    data = {:mode => "selected_server_roles"}
    rows = [
      {:cells => [{:icon => "pficon pficon-server settings-icn"}]},
      row_data(_('Server'), "#{record.name}(#{record.id})"),
      row_data(_('Hostname'), record[:hostname]),
      row_data(_('IP Address'), record[:ipaddress]),
      row_data(_('Status'), record[:status]),
      row_data(_('Process ID'), record[:pid])
    ]
    priority = server_priority(role)
    rows.push(row_data(_('Priority'), priority))
    started_on = record.started_on
    stopped_on = record.stopped_on
    rows.push(row_data(_('Started On'), started_on.blank? ? "" : format_timezone(started_on)))
    rows.push(row_data(_('Stopped On'), stopped_on.blank? ? "" : format_timezone(stopped_on)))
    rows.push(row_data(_('Memory Usage'), record[:memory_usage]))
    rows.push(row_data(_('Memory Size'), record[:memory_size]))
    rows.push(row_data(_('CPU Time'), record[:cpu_time]))
    rows.push(row_data(_('CPU Percent'), record[:percent_cpu]))
    rows.push(row_data(_('Version / Build'), record[:version]))
    data[:rows] = rows
    miq_structured_list(data)
  end

  def server_priority(record)
    if record&.master_supported?
      case record.priority
      when 1
        "primary"
      when 2
        "secondary"
      else
        "normal"
      end
    end
  end

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end
end
