module OpsHelper
  include_concern 'TextualSummary'
  include_concern 'MyServer'
  include VmwareConsoleHelper

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
      _('Caution: Manual changes to configuration files can disable the Server!') << " " <<
        _('Changes made to any individual settings will overwrite settings inherited from the Zone!')
    elsif selected?(x_node, "z")
      _('Caution: Manual changes to configuration files can disable the Zone!') << " " <<
        _('Changes made to any individual settings will overwrite settings inherited from the Region!')
    else
      _('Caution: Manual changes to configuration files can disable the Region!') << " " <<
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

  def render_basic_information_list(selected_server, vm)
    data = {:title => _("Basic Information"), :mode => "miq_server_settings"}
    rows = []
    rows.push({:cells => {:label => _("Hostname"), :value => selected_server.hostname}})
    rows.push({:cells => {:label => _("IP Address"), :value => selected_server.ipaddress}})
    if vm
      rows.push({
                  :cells   => {:label => _("Resides on VM"), :icon => "fa fa-desktop pointer", :value => h(vm.name)},
                  :title   => _("Click to view this VM"),
                  :onclick => "DoNav('/vm/show/#{vm.id}')"
                })
    else
      rows.push({
                  :cells => {:label => _("Resides on VM"), :icon => "fa fa-desktop", :value => _("Not Available")},
                })
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def ops_server_controls(roles, repository_scanning, smartproxy_choices)
    [
      server_roles(roles),
      default_repository(repository_scanning, smartproxy_choices)
    ]
  end

  def ops_settings_form_data(server, data, smartproxy_choices, server_zones)
    {
      :server            => {:id => server.id, :name => server.name},
      :basic_information => ops_basic_information(data[:server], server_zones),
      :server_controls   => ops_server_controls(session[:server_roles], data[:repository_scanning], smartproxy_choices),
      :smtp              => ops_smtp_server(data[:smtp])
    }
  end

  #private

  def form_text(label, value, title = "")
    {:type => :text, :label => label, :value => value, :title => title}
  end

  def form_select(label, value, title, options, include_blank, name)
    {
      :name          => name,
      :type          => :select,
      :label         => label,
      :options       => options,
      :value         => value,
      :title         => title,
      :include_blank => include_blank
    }
  end

  def form_checkbox(name, checked)
    {
      :type    => :checkbox,
      :data    => {:on_text => _('On'), :off_text => _('Off'), :size => 'mini'},
      :name    => name,
      :checked => checked,
    }
  end

  def server_roles(roles)
    server_controls_data = []
    session[:server_roles].sort_by { |_name, desc| desc }.each do |name, desc|
      checked = !session[:selected_roles].nil? && session[:selected_roles].include?(name)
      server_controls_data.push({:name => name, :checked => checked ,:label => desc})
    end
   {:label => _("Server Roles"), :type => :list, :value => server_controls_data}
  end

  def default_repository(repo, smartproxy_choices)
    if smartproxy_choices.blank?
      {:label => _("Default Repository SmartProxy"), :type => :text, :value => _("None Available")}
    else
      form_select('Default Repository SmartProxy', repo[:defaultsmartproxy].to_i, '', smartproxy_choices.sort, true, 'repository_scanning_defaultsmartproxy')
    end
  end

  def ops_basic_information(server, server_zones)

    options = {
      :zone           => server_zones.sort,
      :appliance      => ViewHelper::ALL_TIMEZONES,
      :default_locale => [_('Client Browser Setting'), 'default'] + FastGettext.human_available_locales
    }

    basic = {
      :server_company      => form_text(_("Company Name"), server[:company]),
      :name                => form_text(_("Appliance Name"), server[:name]),
      :appliance_time_zone => form_select(_("Appliance Time Zone"), server[:timezone], server_zone_title_text, options[:appliance], false, 'server_timezone'),
      :default_local       => form_select(_("Default Locale"), server[:locale], server_zone_title_text, options[:default_locale], false, 'locale')
    }
    basic[:zone] = if !MiqServer.zone_is_modifiable?
                     form_text(_("Zone*"), server[:zone], server_zone_title_text, false, 'server_zone')
                   else
                     form_select(_("Zone*"), server[:zone], server_zone_title_text, options[:zone], false, 'server_zone')
                   end
    basic
  end

  def ops_smtp_server(smtp)
    smtp = {
      :host                 => form_text(_("Host"), smtp[:host]),
      :port                 => form_text(_("Port"), smtp[:port]),
      :domain               => form_text(_("Domain"), smtp[:domain]),
      :enable_starttls_auto => {:type => :switch, :label => _("Start TLS Automatically"), :value => smtp[:enable_starttls_auto]},
      :ssl_verify_mode      => form_select(_("SSL Verify Mode"), smtp[:openssl_verify_mode], '', GenericMailer.openssl_verify_modes, false, 'smtp_openssl_verify_mode'),
      :authentication       => form_select(_("Authentication"), smtp[:authentication], '', GenericMailer.authentication_modes, false, 'smtp_authentication'),
      :username             => form_text(_("Username"), smtp[:user_name]),
      :password             => form_text(_("Password"), smtp[:password]),
      :from_email           => form_text(_("From E-Mail Address"), smtp[:from]),
      :test_email           => form_text(_("Test E-Mail Address"), smtp[:new_to]),
    }
    smtp
  end
end
