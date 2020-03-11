class HostController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::MoreShowActions
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[
      hv_info os_info devices network storage_adapters performance timeline storages
      resource_pools vms miq_templates compliance_history custom_button_events cloud_networks cloud_subnets
    ]
  end

  def display_config_info
    @showtype = "config"
    title = case @display
            when "hv_info" then _("VM Monitor Information")
            when "os_info" then _("OS Information")
            when "devices" then _("Devices")
            end
    drop_breadcrumb(:name => "#{@record.name} (#{title})",
                    :url  => show_link(@record, :display => @display))
  end

  alias display_hv_info display_config_info
  alias display_os_info display_config_info
  alias display_devices display_config_info

  def display_tree_resources
    @showtype = "config"
    title, tree = if @display == "network"
                    @network_tree = TreeBuilderNetwork.new(:network_tree, @sb, true, :root => @record)
                    [_("Network"), :network_tree]
                  else
                    @sa_tree = TreeBuilderStorageAdapters.new(:sa_tree, @sb, true, :root => @record)
                    [_("Storage Adapters"), :sa_tree]
                  end
    drop_breadcrumb(:name => "#{@record.name} (#{title})",
                    :url  => show_link(@record, :display => @display))
    self.x_active_tree = tree
  end

  alias display_network display_tree_resources
  alias display_storage_adapters display_tree_resources

  def filesystems_subsets
    scope = nil
    label = _('Files')

    host_service_group = HostServiceGroup.where(:id => params['host_service_group']).first
    if host_service_group
      scope = [[:host_service_group_filesystems, host_service_group.id]]
      label = _("Configuration files of nova service")
    end

    return label, scope
  end

  def filesystems
    label, scope = filesystems_subsets
    show_association('filesystems', label, :filesystems, Filesystem, nil, scope)
  end

  def host_services_subsets
    scope = nil
    label = _('Services')

    host_service_group = HostServiceGroup.where(:id => params['host_service_group']).first
    if host_service_group
      case params[:status]
      when 'running'
        scope = [[:host_service_group_running_systemd, host_service_group.id]]
        label = _("Running system services of %{name}") % {:name => host_service_group.name}
      when 'failed'
        scope = [[:host_service_group_failed_systemd, host_service_group.id]]
        label = _("Failed system services of %{name}") % {:name => host_service_group.name}
      when 'all'
        scope = [[:host_service_group_systemd, host_service_group.id]]
        label = _("All system services of %{name}") % {:name => host_service_group.name}
      end
    end

    return label, scope
  end

  def host_services
    label, scope = host_services_subsets
    show_association('host_services', label, :host_services, SystemService, nil, scope)
    session[:host_display] = "host_services"
  end

  def host_cloud_services
    @center_toolbar = 'host_cloud_services'
    @no_checkboxes = false
    show_association('host_cloud_services', _('Cloud Services'), :cloud_services, CloudService, nil, nil)
  end

  def advanced_settings
    show_association('advanced_settings', _('Advanced Settings'), :advanced_settings, AdvancedSetting)
  end

  def firewall_rules
    @display = "main"
    show_association('firewall_rules', _('Firewall Rules'), :firewall_rules, FirewallRule)
  end

  def guest_applications
    show_association('guest_applications', _('Packages'), :guest_applications, GuestApplication)
  end

  # Show the main Host list view overriding method from Mixins::GenericListMixin
  def show_list
    session[:host_items] = nil
    options = {:no_checkboxes => ActiveRecord::Type::Boolean.new.cast(params[:no_checkboxes])}
    process_show_list(options)
  end

  def start
    redirect_to(:action => 'show_list')
  end

  def edit
    assert_privileges("host_edit")
    if session[:host_items].nil?
      @host = find_record_with_rbac(Host, params[:id])
      @in_a_form = true
      session[:changed] = false
      drop_breadcrumb(:name => _("Edit Host '%{name}'") % {:name => @host.name}, :url => "/host/edit/#{@host.id}")
      @title = _("Info/Settings")
    else # if editing credentials for multi host
      @title = _("Credentials/Settings")
      @host = if params[:selected_host]
                find_record_with_rbac(Host, params[:selected_host])
              else
                Host.new
              end
      @changed = true
      @showlinks = true
      @in_a_form = true
      # Get the db records that are being tagged
      hostitems = Host.find(session[:host_items]).sort_by(&:name)
      @selected_hosts = {}
      hostitems.each do |h|
        @selected_hosts[h.id] = h.name
      end
      build_targets_hash(hostitems)
      @view = get_db_view(Host) # Instantiate the MIQ Report view object
    end
  end

  def update
    assert_privileges("host_edit")
    case params[:button]
    when "cancel"
      session[:edit] = nil # clean out the saved info
      @breadcrumbs&.pop
      if !session[:host_items].nil?
        flash_to_session(_("Edit of credentials for selected Hosts / Nodes was cancelled by the user"))
        javascript_redirect(:action => @lastaction, :display => session[:host_display])
      else
        @host = find_record_with_rbac(Host, params[:id])
        flash_to_session(_("Edit of Host / Node \"%{name}\" was cancelled by the user") % {:name => @host.name})
        javascript_redirect(:action => @lastaction, :id => @host.id, :display => session[:host_display])
      end

    when "save"
      if session[:host_items].nil?
        @host = find_record_with_rbac(Host, params[:id])
        old_host_attributes = @host.attributes.clone
        valid_host = find_record_with_rbac(Host, params[:id])
        set_record_vars(valid_host, :validate) # Set the record variables, but don't save
        if valid_record? && set_record_vars(@host) && @host.save
          flash_to_session(_("Host / Node \"%{name}\" was saved") % {:name => @host.name})
          @breadcrumbs&.pop
          AuditEvent.success(build_saved_audit_hash_angular(old_host_attributes, @host, false))
          if @lastaction == 'show_list'
            javascript_redirect(:action => "show_list")
          else
            javascript_redirect(:action => "show", :id => @host.id.to_s)
          end
          nil
        else
          @errors.each { |msg| add_flash(msg, :error) }
          @host.errors.each do |field, msg|
            add_flash("#{field.to_s.capitalize} #{msg}", :error)
          end
          drop_breadcrumb(:name => _("Edit Host '%{name}'") % {:name => @host.name}, :url => "/host/edit/#{@host.id}")
          @in_a_form = true
          javascript_flash
        end
      else
        valid_host = find_record_with_rbac(Host, params[:validate_id].presence || session[:host_items].first.to_i)
        # Set the record variables, but don't save
        creds = set_credentials(valid_host, :validate)
        if valid_record?
          @error = Host.batch_update_authentication(session[:host_items], creds)
        end
        if @error || @error.blank?
          flash_to_session(_("Credentials/Settings saved successfully"))
          javascript_redirect(:action => 'show_list')
        else
          drop_breadcrumb(:name => _("Edit Host '%{name}'") % {:name => @host.name}, :url => "/host/edit/#{@host.id}")
          @in_a_form = true
          javascript_flash
        end
      end
    when "reset"
      params[:edittype] = @edit[:edittype] # remember the edit type
      flash_to_session(_("All changes have been reset"), :warning)
      @in_a_form = true
      javascript_redirect(:action => 'edit', :id => @host.id.to_s)
    when "validate"
      verify_host = find_record_with_rbac(Host, params[:validate_id] ? params[:validate_id].to_i : params[:id])
      if session[:host_items].nil?
        set_record_vars(verify_host, :validate)
      else
        set_credentials(verify_host, :validate)
      end
      @in_a_form = true
      @changed = session[:changed]
      require "net/ssh"
      begin
        verify_host.verify_credentials(params[:type], :remember_host => params.key?(:remember_host))
      rescue MiqException::MiqSshUtilHostKeyMismatch # Capture the Host key mismatch from the verify
        render :update do |page|
          page << javascript_prologue
          new_url = url_for_only_path(:action => "update", :button => "validate", :type => params[:type], :remember_host => "true", :escape => false)
          page << "if (confirm('#{_('The Host SSH key has changed, do you want to accept the new key?')}')) miqAjax('#{new_url}', true);"
        end
        return
      rescue StandardError => bang
        add_flash(bang.to_s, :error)
      else
        add_flash(_("Credential validation was successful"))
      end
      javascript_flash
    end
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w[vms storages].include?(@display) # Were we displaying vms/storages

    if params[:pressed].starts_with?("vm_", # Handle buttons from sub-items screen
                                     "miq_template_",
                                     "guest_",
                                     "storage_")

      pfx = pfx_for_vm_button_pressed(params[:pressed])
      process_vm_buttons(pfx)

      scanstorage if params[:pressed] == "storage_scan"
      tag(Storage) if params[:pressed] == "storage_tag"

      # Control transferred to another screen, so return
      return if ["host_drift", "#{pfx}_compare", "#{pfx}_tag", "#{pfx}_policy_sim",
                 "#{pfx}_retire", "#{pfx}_protect", "#{pfx}_ownership",
                 "#{pfx}_reconfigure", "#{pfx}_retire", "#{pfx}_right_size",
                 "storage_tag"].include?(params[:pressed]) && @flash_array.nil?

      unless ["#{pfx}_edit", "#{pfx}_miq_request_new", "#{pfx}_clone", "#{pfx}_migrate", "#{pfx}_publish", 'vm_rename'].include?(params[:pressed])
        @refresh_div = "main_div"
        @refresh_partial = "layouts/gtl"
        show
      end
    else # Handle Host buttons
      params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh
      @refresh_div = "main_div" # Default div for button.rjs to refresh
      case params[:pressed]
      when 'common_drift' then drift_analysis
      when 'custom_button' then custom_buttons
      when 'host_analyze_check_compliance' then analyze_check_compliance_hosts
      when 'host_check_compliance' then check_compliance_hosts
      when 'host_cloud_service_scheduling_toggle' then toggleservicescheduling
      when 'host_compare' then comparemiq
      when 'host_delete' then deletehosts
      when 'host_edit' then edit_record
      when 'host_introspect' then introspecthosts
      when 'host_manageable' then sethoststomanageable
      when 'host_protect' then assign_policies(Host)
      when 'host_provide' then providehosts
      when 'host_refresh' then refreshhosts
      when 'host_scan' then scanhosts
      when 'host_tag' then tag(Host)
      when 'host_toggle_maintenance' then maintenancehosts
      end
      # Handle Host power buttons
      if %w[host_shutdown host_reboot host_standby host_enter_maint_mode host_exit_maint_mode host_start
            host_stop host_reset].include?(params[:pressed])
        powerbutton_hosts(params[:pressed].split("_")[1..-1].join("_")) # Handle specific power button
      end

      perf_chart_chooser if params[:pressed] == "perf_reload"
      perf_refresh_data if params[:pressed] == "perf_refresh"

      return if ["custom_button"].include?(params[:pressed]) # custom button screen, so return, let custom_buttons method handle everything
      return if %w[host_tag host_compare common_drift host_protect perf_reload].include?(params[:pressed]) &&
                @flash_array.nil? # Another screen showing, so return

      if @flash_array.nil? && !@refresh_partial # if no button handler ran, show not implemented msg
        add_flash(_("Button not yet implemented"), :error)
        @refresh_partial = "layouts/flash_msg"
        @refresh_div = "flash_msg_div"
      elsif @flash_array && @lastaction == "show"
        @host = @record = identify_record(params[:id])
        @refresh_partial = "layouts/flash_msg"
        @refresh_div = "flash_msg_div"
      end
    end

    if @lastaction == "show" && ["custom_button"].include?(params[:pressed])
      @host = @record = identify_record(params[:id])
    end

    if single_delete_test
      single_delete_redirect
    elsif params[:pressed].ends_with?("_edit") ||
          ["#{pfx}_miq_request_new", "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed]) ||
          ["#{pfx}_clone", 'vm_rename'].include?(params[:pressed]) && @flash_array.nil?
      if @flash_array
        show_list
        replace_gtl_main_div
      elsif @redirect_controller
        if ["#{pfx}_clone", "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed])
          if flash_errors?
            javascript_flash
          else
            javascript_redirect(:controller     => @redirect_controller,
                                :action         => @refresh_partial,
                                :id             => @redirect_id,
                                :prov_type      => @prov_type,
                                :prov_id        => @prov_id,
                                :org_controller => @org_controller,
                                :escape         => false)
          end
        else
          render_or_redirect_partial(pfx)
        end
      else
        javascript_redirect(:action => @refresh_partial, :id => @redirect_id)
      end
    elsif @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    else
      render_flash unless performed?
    end
  end

  def host_form_fields
    assert_privileges("host_edit")
    host = find_record_with_rbac(Host, params[:id])
    validate_against = if session.fetch_path(:edit, :validate_against) && params[:button] != "reset"
                         session.fetch_path(:edit, :validate_against)
                       end

    host_hash = {
      :name             => host.name,
      :hostname         => host.hostname,
      :ipmi_address     => host.ipmi_address || "",
      :custom_1         => host.custom_1 || "",
      :user_assigned_os => host.user_assigned_os,
      :operating_system => !(host.operating_system.nil? || host.operating_system.product_name.nil?),
      :mac_address      => host.mac_address || "",
      :default_userid   => host.authentication_userid.to_s,
      :remote_userid    => host.has_authentication_type?(:remote) ? host.authentication_userid(:remote).to_s : "",
      :ws_userid        => host.has_authentication_type?(:ws) ? host.authentication_userid(:ws).to_s : "",
      :ipmi_userid      => host.has_authentication_type?(:ipmi) ? host.authentication_userid(:ipmi).to_s : "",
      :validate_id      => validate_against,
    }

    render :json => host_hash
  end

  private

  def record_class
    case params[:display] || @display
    when 'storages'
      Storage
    when 'vms', 'miq_templates'
      VmOrTemplate
    else
      Host
    end
  end

  def textual_group_list
    [
      %i[properties relationships],
      %i[
        compliance security configuration diagnostics smart_management miq_custom_attributes
        ems_custom_attributes authentications cloud_services openstack_hardware_status openstack_service_status
      ]
    ]
  end
  helper_method :textual_group_list

  def breadcrumb_name(_model)
    _("Hosts")
  end

  # Validate the host record fields
  def valid_record?
    valid = true
    @errors = []
    if params[:ws_port] && (params[:ws_port] !~ /^\d+$/)
      @errors.push(_("Web Services Listen Port must be numeric"))
      valid = false
    end
    if params[:log_wrapsize] && ((params[:log_wrapsize] !~ /^\d+$/) || params[:log_wrapsize].to_i.zero?)
      @errors.push(_("Log Wrap Size must be numeric and greater than zero"))
      valid = false
    end
    valid
  end

  # Set record variables to new values
  def set_record_vars(host, mode = nil)
    host.name             = params[:name]
    host.hostname         = params[:hostname].strip unless params[:hostname].nil?
    host.ipmi_address     = params[:ipmi_address]
    host.mac_address      = params[:mac_address]
    host.custom_1         = params[:custom_1] unless mode == :validate
    host.user_assigned_os = params[:user_assigned_os]
    set_credentials(host, mode)
    true
  end

  def set_credentials(host, mode)
    creds = {}
    if params[:default_userid]
      default_password = params[:default_password] || host.authentication_password
      creds[:default] = {:userid => params[:default_userid], :password => default_password}
    end
    if params[:remote_userid]
      remote_password = params[:remote_password] || host.authentication_password(:remote)
      creds[:remote] = {:userid => params[:remote_userid], :password => remote_password}
    end
    if params[:ws_userid]
      ws_password = params[:ws_password] || host.authentication_password(:ws)
      creds[:ws] = {:userid => params[:ws_userid], :password => ws_password}
    end
    if params[:ipmi_userid]
      ipmi_password = params[:ipmi_password] || host.authentication_password(:ipmi)
      creds[:ipmi] = {:userid => params[:ipmi_userid], :password => ipmi_password}
    end
    host.update_authentication(creds, :save => (mode != :validate))
    creds
  end

  def title
    _("Host")
  end

  def get_session_data
    super
    @drift_db = "Host"
  end

  def set_session_data
    super
    session[:miq_compressed]  = @compressed  unless @compressed.nil?
    session[:miq_exists_mode] = @exists_mode unless @exists_mode.nil?
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Infrastructure")},
        {:title => _("Hosts"), :url => controller_url},
      ],
      :record_info => @host,
    }.compact
  end

  menu_section :inf
  has_custom_buttons
end
