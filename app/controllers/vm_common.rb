module VmCommon
  extend ActiveSupport::Concern
  include ActionView::Helpers::JavaScriptHelper
  include ChargebackPreview
  include ProvisionCustomizeHelper
  include HidePartialHelper

  def textual_group_list
    [
      %i[properties multi_region lifecycle relationships vmsafe normal_operating_ranges miq_custom_attributes ems_custom_attributes labels],
      %i[compliance power_management security configuration datastore_allocation datastore_usage diagnostics tags]
    ]
  end

  def textual_summary_flash_list
    %i[reboot_needed]
  end

  included do
    private :textual_group_list
    private :textual_summary_flash_list
    helper_method :textual_group_list
    helper_method :textual_summary_flash_list
    helper_method :select_check?
    helper_method :disable_check?
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit]                                  # Restore @edit for adv search box
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh
    @refresh_div = "main_div"                               # Default div for button.rjs to refresh

    case params[:pressed]
    when 'custom_button'
      cancel_endpoint = "/#{params[:controller]}/explorer"
      custom_buttons(nil, :cancel_endpoint => cancel_endpoint)
      return
    when 'perf_reload'
      perf_chart_chooser
      # VM sub-screen is showing, so return
      return if @flash_array.nil?
    when 'perf_refresh'
      perf_refresh_data
    when 'remove_service'
      remove_service
    end

    if @flash_array.nil? # if no button handler ran, show not implemented msg
      add_flash(_("Button not yet implemented"), :error)
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    # Figure out what was showing to refresh it
    elsif @lastaction == "show" && ["vmtree"].include?(@showtype)
      @refresh_partial = @showtype
    elsif @lastaction == "show" && ["config"].include?(@showtype)
      @refresh_partial = @showtype
    elsif @lastaction == "show_list"
    else
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    end
    @vm = @record = identify_record(params[:id], VmOrTemplate) unless @lastaction == "show_list"

    if single_delete_test(true)
      single_delete_redirect
    elsif params[:pressed].ends_with?("_edit")
      if @redirect_controller
        javascript_redirect(:controller => @redirect_controller, :action => @refresh_partial, :id => @redirect_id, :org_controller => @org_controller)
      else
        javascript_redirect(:action => @refresh_partial, :id => @redirect_id)
      end
    elsif @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    elsif @refresh_div == "flash_msg_div"
      javascript_flash(:spinner_off => true)
    else
      options
      partial_replace(@refresh_div, "vm_common/#{@refresh_partial}")
    end
  end

  # to reload currently displayed summary screen in explorer
  def reload
    @_params[:id] = if x_node.split('-')[1] != params[:id] && params[:id].present?
                      'v-' + params[:id]
                    else
                      x_node
                    end
    tree_select
  end

  def vm_rename
    @record = find_record_with_rbac(VmOrTemplate, params[:miq_grid_checks] || params[:id])
    unless @record.supports?(:rename)
      add_flash(_("Renaming selected VM \"%{name}\" is not supported") % {:name => @record.name}, :error)
      if @explorer
        @record = @sb[:action] = nil
        replace_right_cell
      end
      return
    end
    if @explorer
      @changed = session[:changed] = false
    end
    @refresh_partial = 'rename_vm'
  end

  def show_timeline
    db = record_class
    @display = "timeline"
    session[:tl_record_id] = params[:id] if params[:id]
    @record = find_record_with_rbac(db, session[:tl_record_id])
    @timeline = @timeline_filter = true
    @lastaction = "show_timeline"
    tl_build_timeline # Create the timeline report
    drop_breadcrumb(:name => _("Timelines"), :url => "/#{db}/show_timeline/#{@record.id}?refresh=n")
    if @explorer
      @refresh_partial = "layouts/tl_show"
      if params[:refresh]
        @sb[:action] = "timeline"
        replace_right_cell
      end
    end
  end
  alias_method :image_timeline, :show_timeline
  alias_method :instance_timeline, :show_timeline
  alias_method :vm_timeline, :show_timeline
  alias_method :miq_template_timeline, :show_timeline

  def x_show
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    generic_x_show
  end

  def download_summary_pdf
    super(VmOrTemplate) do
      @flash_array = []
      @record = identify_record(params[:id], VmOrTemplate)
    end
  end

  def show(id = nil)
    @flash_array = [] if params[:display] && params[:display] != "snapshot_info"
    @sb[:action] = params[:display]

    return if perfmenu_click?
    @display = params[:display] || "main" unless pagination_or_gtl_request?
    @display = params[:vm_tree] if params[:vm_tree]

    @lastaction = "show"
    @showtype = "config"
    @record = identify_record(id || params[:id], VmOrTemplate)
    if @record.nil?
      referer = Rails.application.routes.recognize_path(request.referer)
      redirect_to(:controller => referer[:controller], :action => referer[:action])
      return
    end
    return if record_no_longer_exists?(@record)

    @explorer = true if request.xml_http_request? # Ajax request means in explorer

    unless @explorer
      tree_node_id = TreeBuilder.build_node_id(@record)
      session[:exp_parms] = {:display => @display, :refresh => params[:refresh], :id => tree_node_id}
      controller_name = controller_for_vm(model_for_vm(@record))
      # redirect user back to where they came from if they dont have access to any of vm explorers
      # or redirect them to the one they have access to
      case controller_name
      when "vm_infra"
        redirect_controller = role_allows?(:feature => "vandt_accord") || role_allows?(:feature => "vms_filter_accord") ? "vm_infra" : nil
      when "vm_cloud"
        redirect_controller = role_allows?(:feature => "instances_accord") || role_allows?(:feature => "instances_filter_accord") ? "vm_cloud" : nil
      end

      redirect_controller ||= role_allows?(:feature => "vms_instances_filter_accord") ? "vm_or_template" : nil

      if redirect_controller
        action = "explorer"
      else
        url = request.env['HTTP_REFERER'].split('/')
        flash_to_session(_("User '%{username}' is not authorized to access '%{controller_name}'") %
          {:username => current_userid, :controller_name => ui_lookup(:table => controller_name)}, :warning)
        redirect_controller  = url[3]
        action               = url[4]
      end

      redirect_to(:controller => redirect_controller, :action => action)
      return
    end

    rec_cls = @record.class.base_model.to_s == 'MiqTemplate' ? 'miq_template' : 'vm'
    @gtl_url = "/show"
    if %w[main].include?(@display)
      get_tagdata(@record)
      drop_breadcrumb({:name => _("Virtual Machines"),
                       :url  => "/#{rec_cls}/show_list?page=#{@current_page}&refresh=y"}, true)
      drop_breadcrumb(:name => @record.name + _(" (Summary)"), :url => "/#{rec_cls}/show/#{@record.id}")
      @showtype = "main"
    elsif @display == "networks"
      drop_breadcrumb(:name => @record.name + _(" (Networks)"),
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
    elsif @display == "os_info"
      drop_breadcrumb(:name => @record.name + _(" (OS Information)"),
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
    elsif @display == "hv_info"
      drop_breadcrumb(:name => @record.name + _(" (Container)"),
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
    elsif @display == "resources_info"
      drop_breadcrumb(:name => @record.name + _(" (Resources)"),
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
    elsif @display == "snapshot_info"
      drop_breadcrumb(:name => @record.name + _(" (Snapshots)"),
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
      session[:snap_selected] = nil if Snapshot.find_by(:id => session[:snap_selected]).nil?
      @sb[@sb[:active_accord]] = TreeBuilder.build_node_id(@record)
      @snapshot_tree = TreeBuilderSnapshots.new(:snapshot_tree, @sb, true, :root => @record)
      selected_snapshot_node = x_node(@snapshot_tree.name)
      @active = if selected_snapshot_node && selected_snapshot_node != 'root'
                  snap_selected = Snapshot.find(selected_snapshot_node.split('-').last)
                  session[:snap_selected] = snap_selected.id
                  snap_selected.current?
                else
                  false
                end
    elsif @display == "devices"
      drop_breadcrumb(:name => @record.name + _(" (Devices)"),
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
    elsif @display == "custom_button_events"
      drop_breadcrumb(:name => @record.name + _(" (Custom Button Events)"),
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
      @no_checkboxes = true # FIXME: move this to a parameter below and handle with ReportDataAdditionalOptions
      @showtype = "details"
      get_view(CustomButtonEvent, :parent => @record, :parent_method => 'custom_button_events', :clickable => false)
    elsif @display == "vmtree_info"
      drop_breadcrumb({:name => @record.name, :url => "/#{rec_cls}/show/#{@record.id}"}, true)
      drop_breadcrumb(:name => @record.name + _(" (Genealogy)"),
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
      if @record.parents.length > 1
        add_flash(_("VM has too many parents."), :error)
        javascript_flash(:spinner_off => true)
        return
      else
        @genealogy_tree = TreeBuilderGenealogy.new(:genealogy_tree, @sb, true, :root => @record)
        session[:genealogy_tree_root_id] = @record.parent.presence.try(:id) || @record.id
      end
    elsif @display == "compliance_history"
      count = params[:count] ? params[:count].to_i : 10
      @ch_tree = TreeBuilderComplianceHistory.new(:ch_tree, @sb, true, :root => @record)
      drop_breadcrumb({:name => @record.name, :url => "/#{rec_cls}/show/#{@record.id}"}, true)
      if count == 1
        drop_breadcrumb(:name => @record.name + _(" (Latest Compliance Check)"),
                        :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
      else
        drop_breadcrumb(:name => @record.name + _(" (Compliance History - Last %{number} Checks)") % {:number => count},
                        :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
      end
      @showtype = @display
    elsif @display == "performance"
      @showtype = "performance"
      drop_breadcrumb(:name => _("%{name} Capacity & Utilization") % {:name => @record.name},
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}&refresh=n")
      perf_gen_init_options # Initialize perf chart options, charts will be generated async
    elsif @display == "disks"
      @showtype = "disks"
      disks
      drop_breadcrumb(:name => _("%{name} (Disks)") % {:name => @record.name},
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
    end

    get_host_for_vm(@record)
    session[:tl_record_id] = @record.id

    if @explorer
      @refresh_partial = "layouts/performance"
      replace_right_cell unless params[:display] == "performance"
    end
  end

  def node_id(id)
    id == 'root' ? session[:genealogy_tree_root_id] : parse_nodetype_and_id(id).last
  end

  def genealogy_tree_selected
    base = node_id(params[:id])
    @display = "vmtree_info"
    javascript_redirect(:action => "show", :id => base, :vm_tree => "vmtree_info")
  end

  def snap_pressed
    session[:snap_selected] = params[:id]
    @snap_selected = Snapshot.find_by(:id => session[:snap_selected])
    @vm = @record = identify_record(x_node_right_cell.split('-').last, VmOrTemplate)
    if @snap_selected.nil?
      @display = "snapshot_info"
      add_flash(_("Last selected Snapshot no longer exists"), :error)
    end
    @active = @snap_selected.current? if @snap_selected
    @center_toolbar = 'x_vm_snapshot'
    @explorer = true
    render :update do |page|
      page << javascript_prologue
      page << javascript_reload_toolbars

      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page << "miqScrollTop();" if @flash_array.present?
      page.replace("desc_content", :partial => "/vm_common/snapshots_desc",
                                   :locals  => {:selected => params[:id]})
    end
  end

  def disks
  end

  def processes
    show_association('processes', _('Running Processes'), %i[operating_system processes], OsProcess,
                     'processes')
  end

  def registry_items
    show_association('registry_items', _('Registry Entries'), :registry_items, RegistryItem)
  end

  def advanced_settings
    show_association('advanced_settings', _('Advanced Settings'), :advanced_settings,
                     AdvancedSetting)
  end

  def linux_initprocesses
    show_association('linux_initprocesses', _('Init Processes'), :linux_initprocesses,
                     SystemService, 'linux_initprocesses')
  end

  def win32_services
    show_association('win32_services', _('Win32 Services'), :win32_services, SystemService,
                     'win32_services')
  end

  def kernel_drivers
    show_association('kernel_drivers', _('Kernel Drivers'), :kernel_drivers, SystemService,
                     'kernel_drivers')
  end

  def filesystem_drivers
    show_association('filesystem_drivers', _('File System Drivers'), :filesystem_drivers,
                     SystemService, 'filesystem_drivers')
  end

  def filesystems
    show_association('filesystems', _('Files'), :filesystems, Filesystem)
  end

  def security_groups
    show_association('security_groups', _('Security Groups'), :security_groups, SecurityGroup)
  end

  def floating_ips
    show_association('floating_ips', _('Floating IPs'), :floating_ips, FloatingIp)
  end

  def cloud_subnets
    show_association('cloud_subnets', _('Subnets'), :cloud_subnets, CloudSubnet)
  end

  def cloud_networks
    show_association('cloud_networks', _('Networks'), :cloud_networks, CloudNetwork)
  end

  def cloud_volumes
    show_association('cloud_volumes', _('Cloud Volumes'), :cloud_volumes, CloudVolume)
  end

  def network_routers
    show_association('network_routers', _('Routers'), :network_routers, NetworkRouter)
  end

  def network_ports
    show_association('network_ports', _('Ports'), :network_ports, NetworkPort)
  end

  def snap
    assert_privileges(params[:pressed])
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    @name = @description = ""
    @in_a_form = true
    drop_breadcrumb(:name    => _("Snapshot VM '%{name}'") % {:name => @record.name},
                    :url     => "/vm_common/snap",
                    :display => "snapshot_info")
    if @explorer
      @edit ||= {}
      @edit[:explorer] = true
      session[:changed] = true
      @refresh_partial = "vm_common/snap"
    end
  end
  alias_method :vm_snapshot_add, :snap

  def render_missing_field(session, missing_field_name)
    add_flash(_("%{missing_field_name} is required") %
              {:missing_field_name => missing_field_name}, :error)
    @in_a_form = true
    drop_breadcrumb(:name => _("Snapshot VM '%{name}'") % {:name => @record.name},
                    :url  => "/vm_common/snap")
    if session[:edit] && session[:edit][:explorer]
      @edit = session[:edit] # saving it to use in next transaction
      javascript_flash(:spinner_off => true)
    else
      render :action => "snap"
    end
  end

  def policies
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    @lastaction = "rsop"
    @showtype = "policies"
    drop_breadcrumb(:name => _("Policy Simulation Details for %{name}") % {:name => @record.name},
                    :url  => "/vm/policies/#{@record.id}")
    @polArr = @record.resolve_profiles(session[:policies].keys).sort_by { |p| p["description"] }
    @policy_options = {}
    @policy_options[:out_of_scope] = true
    @policy_options[:passed] = true
    @policy_options[:failed] = true
    @policy_simulation_tree = TreeBuilderPolicySimulation.new(:policy_simulation_tree,
                                                              @sb,
                                                              true,
                                                              :root      => @polArr,
                                                              :root_name => @record.name,
                                                              :options   => @policy_options)
    @edit = session[:edit] if session[:edit]
    if @edit && @edit[:explorer]
      @sb[:explorer] = true
      if session[:policies].empty?
        render_flash(_("No policies were selected for Policy Simulation."), :error)
        return
      end
      @in_a_form = true
      replace_right_cell(:action => 'policy_sim', :refresh_breadcrumbs => false)
    else
      @right_cell_text = _("%{vm_or_template} Policy Simulation") % {:vm_or_template => ui_lookup(:table => vm_or_instance(@record))}
      @sb[:explorer] = nil
      render :template => 'vm/show'
    end
  end

  def policy_show_options
    @explorer = @sb[:explorer]
    if params[:passed] == "null" || params[:passed] == ""
      @policy_options[:passed] = false
      @policy_options[:failed] = true
    elsif params[:failed] == "null" || params[:failed] == ""
      @policy_options[:passed] = true
      @policy_options[:failed] = false
    elsif params[:failed] == "1"
      @policy_options[:failed] = true
    elsif params[:passed] == "1"
      @policy_options[:passed] = true
    end
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    @policy_simulation_tree = TreeBuilderPolicySimulation.new(:policy_simulation_tree,
                                                              @sb,
                                                              true,
                                                              :root      => @polArr,
                                                              :root_name => @record.name,
                                                              :options   => @policy_options)
    replace_main_div({:partial => "vm_common/policies"}, {:flash => true})
  end

  # Show/Unshow out of scope items
  def policy_options
    @explorer = @sb[:explorer]
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    @policy_options ||= {}
    @policy_options[:out_of_scope] = (params[:out_of_scope] == "1")
    @policy_simulation_tree = TreeBuilderPolicySimulation.new(:policy_simulation_tree,
                                                              @sb,
                                                              true,
                                                              :root      => @polArr,
                                                              :root_name => @record.name,
                                                              :options   => @policy_options)
    replace_main_div({:partial => "vm_common/policies"}, {:flash => true})
  end

  # Set right_size selected db records
  def right_size(record = nil)
    @record ||= record ? record : find_record_with_rbac(Vm, params[:id])
    @lastaction = "right_size"
    @rightsize = true
    @in_a_form = true
    if params[:button] == "back"
      javascript_prologue
      javascript_redirect(previous_breadcrumb_url)
    end
    if !@explorer && params[:button] != "back"
      drop_breadcrumb(:name => _("Right Size VM '%{name}'") % {:name => @record.name}, :url => "/vm/right_size")
      render :action => "show"
    end
  end

  def right_size_print
    @record = find_record_with_rbac(Vm, params[:id])
    @display = "download_pdf"
    disable_client_cache

    @options = {
      :page_layout => "portrait",
      :page_size   => "us-letter",
      :title       => "\"#{@record.name}\"".html_safe,
      :quadicon    => false
    }

    render :template => 'vm_common/_right_size', :layout => '/layouts/print'
  end

  def evm_relationship
    @record = find_record_with_rbac(VmOrTemplate, params[:id]) # Set the VM object
    @edit ||= {}

    @in_a_form = true
    if @explorer
      @refresh_partial = "vm_common/evm_relationship"
      @edit[:explorer] = true
    end
  end
  alias_method :image_evm_relationship, :evm_relationship
  alias_method :instance_evm_relationship, :evm_relationship
  alias_method :vm_evm_relationship, :evm_relationship
  alias_method :miq_template_evm_relationship, :evm_relationship

  def delete
    @lastaction = "delete"
    redirect_to(:action => 'show_list', :layout => false)
  end

  def destroy
    find_record_with_rbac(VmOrTemplate, params[:id]).destroy
    redirect_to(:action => 'list')
  end

  def add_to_service
    @record = find_record_with_rbac(Vm, params[:id])
    @svcs = {}
    Service.all.each { |s| @svcs[s.name] = s.id }
    drop_breadcrumb(:name => _("Add VM to a Service"), :url => "/vm/add_to_service")
    @in_a_form = true
  end

  def add_vm_to_service
    @record = find_record_with_rbac(Vm, params[:id])
    if params["cancel.x"]
      add_flash(_("Add VM \"%{name}\" to a Service was cancelled by the user") % {:name => @record.name})
    else
      chosen = params[:chosen_service].to_i
      flash = _("VM and Instance \"%{name}\" successfully added to Service \"%{to_name}\"") % {:name => @record.name, :to_name => Service.find(chosen).name}
      begin
        @record.add_to_vsc(Service.find(chosen).name)
      rescue => bang
        flash = _("Error during 'Add VM to service': %{message}") % {:message => bang}
      end
      add_flash(flash)
    end
    flash_to_session
    redirect_to(:action => @lastaction, :id => @record.id)
  end

  def remove_service
    assert_privileges(params[:pressed])
    @record = find_record_with_rbac(Vm, params[:id])
    begin
      @vervice_name = Service.find_by(:name => @record.location).name
      @record.remove_from_vsc(@vervice_name)
    rescue => bang
      add_flash(_("Error during 'Remove VM from service': %{message}") % {:message => bang.message}, :error)
    else
      add_flash(_("VM successfully removed from service \"%{name}\"") % {:name => @vervice_name})
    end
  end

  def edit
    @record = find_record_with_rbac(VmOrTemplate, params[:id]) # Set the VM object
    
    # reset @explorer if coming from explorer views
    @edit ||= {}
    @edit[:explorer] = true if params[:action] == "x_button" || session.fetch_path(:edit, :explorer)
    @explorer = true if @edit[:explorer]

    drop_breadcrumb(:name => _("Edit VM '%{name}'") % {:name => @record.name}, :url => "/vm/edit") unless @explorer

    @refresh_partial = "vm_common/form"
  end

  # FIXME: these match toolbar button names/features
  alias_method :image_edit, :edit
  alias_method :instance_edit, :edit
  alias_method :vm_edit, :edit
  alias_method :miq_template_edit, :edit

  def set_checked_items
    session[:checked_items] = []
    if params[:all_checked]
      ids = params[:all_checked].split(',')
      ids.each do |id|
        id = node_id(id)
        session[:checked_items].push(id) unless session[:checked_items].include?(id)
      end
    end
    @lastaction = "set_checked_items"
    head :ok
  end

  def scan_history
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    @scan_history = ScanHistory.find_by(:vm_or_template_id => @record.id)
    @showtype = "scan_history"
    @lastaction = "scan_history"
    @gtl_url = "/scan_history"
    @no_checkboxes = true
    @showlinks = true

    @view, @pages = get_view(ScanHistory, :parent => @record) # Get the records (into a view) and the paginator

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    if @scan_history.nil?
      drop_breadcrumb(:name => @record.name + _(" (Analysis History)"), :url => "/vm/#{@record.id}")
    else
      drop_breadcrumb(:name => @record.name + _(" (Analysis History)"),
                      :url  => "/vm/scan_history/#{@scan_history.vm_or_template_id}")
    end

    if @explorer || request.xml_http_request? # Is this an Ajax request?
      @sb[:action] = params[:action]
      @refresh_partial = "layouts/#{@showtype}"
      replace_right_cell
    else
      render :action => 'show'
    end
  end

  def scan_histories
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    @explorer = true if request.xml_http_request? # Ajax request means in explorer
    @scan_history = ScanHistory.find_by(:vm_or_template_id => @record.id)
    if @scan_history.nil?
      flash_to_session(_("Error: Record no longer exists in the database"), :error)
      redirect_to(:action => "scan_history")
      return
    end
    @lastaction = "scan_histories"
    @sb[:action] = params[:action]
    params[:display] = "scan_histories"
    if !params[:show].nil? || !params[:x_show].nil?
      id = params[:show] ? params[:show] : params[:x_show]
      @item = ScanHistory.find(id)
      drop_breadcrumb(:name => time_ago_in_words(@item.started_on.in_time_zone(Time.zone)).titleize, :url => "/vm/scan_history/#{@scan_history.vm_or_template_id}?show=#{@item.id}")
      @view = get_db_view(ScanHistory) # Instantiate the MIQ Report view object
      show_item
    else
      drop_breadcrumb({:name => time_ago_in_words(@scan_history.started_on.in_time_zone(Time.zone)).titleize, :url => "/vm/show/#{@scan_history.vm_or_template_id}"}, true)
      show_details(ScanHistory)
    end
  end

  def parent_folder_id(vm)
    if vm.orphaned
      "xx-orph"
    elsif vm.archived
      "xx-arch"
    elsif vm.cloud && vm.template
      TreeBuilder.build_node_id(vm.ext_management_system)
    elsif vm.cloud && vm.availability_zone_id.nil?
      TreeBuilder.build_node_id(vm.ext_management_system)
    elsif vm.cloud
      TreeBuilder.build_node_id(vm.availability_zone)
    elsif (blue_folder = vm.parent_blue_folder) && !blue_folder.hidden
      TreeBuilder.build_node_id(blue_folder)
    elsif vm.ems_id # has no folder parent but is in the tree
      if vm.parent_datacenter
        TreeBuilder.build_node_id(vm.parent_datacenter)
      else
        TreeBuilder.build_node_id(vm.ext_management_system)
      end
    end
  end

  # Tree node selected in explorer
  def tree_select
    assert_accordion_and_tree_privileges(x_active_tree)

    @explorer = true
    @lastaction = "explorer"
    @sb[:action] = nil

    @nodetype, id = parse_nodetype_and_id(params[:id])
    record_requested = %w[Vm MiqTemplate].include?(TreeBuilder.get_model_for_prefix(@nodetype))

    if record_requested && !@record
      @vm = @record = identify_record(id, VmOrTemplate)
    end

    # Handle filtered tree nodes
    if x_active_tree.to_s =~ /_filter_tree$/ && !record_requested

      search_id = @nodetype == "root" ? 0 : id
      adv_search_build(model_from_active_tree(x_active_tree))
      session[:edit] = @edit # Set because next method will restore @edit from session
      listnav_search_selected(search_id) unless params.key?(:search_text) # Clear or set the adv search filter
      if @edit[:adv_search_applied] &&
         MiqExpression.quick_search?(@edit[:adv_search_applied][:exp]) &&
         %w[reload tree_select].include?(params[:action])
        self.x_node = params[:id]
        quick_search_show
        return
      end
    end

    if record_requested && @record.nil?
      unless flash_errors?
        add_flash(_("The entity is not available or user is not authorized to access it."), :error)
      end
      javascript_flash(:spinner_off => true, :activate_node => {:tree => x_active_tree.to_s, :node => x_node})
    end

    self.x_node = (@record.present? ? parent_folder_id(@record) : params[:id])
    replace_right_cell
  end

  # Return vm_cloud or vm_infra based on selected record
  def vm_or_instance(record)
    if record
      record_model = model_for_vm(record)
      controller_for_vm(record_model)
    end
  end

  private

  # if node is VM or Template is true - select parent node in explorer tree but show info of Vm/Template
  def resolve_node_info(id)
    nodetype, id = id.split("-")

    if nodetype == 'v' || nodetype == 't'
      @vm = VmOrTemplate.find(id)
      self.x_node = parent_folder_id(@vm)
    else
      self.x_node = "#{nodetype}-#{id}"
    end
    get_node_info("#{nodetype}-#{id}")
  end
  public :resolve_node_info

  # returning [model, title]
  def tree_name_to_model_and_title(tree_name)
    case tree_name
    when "images_filter_tree"
      ["ManageIQ::Providers::CloudManager::Template", _('All Images')]
    when "images_tree"
      ["ManageIQ::Providers::CloudManager::Template", _('All Images by Provider')]
    when "instances_filter_tree"
      ["ManageIQ::Providers::CloudManager::Vm", _('All Instances')]
    when "instances_tree"
      ["ManageIQ::Providers::CloudManager::Vm", _('All Instances by Provider')]
    when "vandt_tree"
      ["VmOrTemplate", _('All VMs & Templates')]
    when "vms_instances_filter_tree"
      ["Vm", _('All VMs & Instances')]
    when "templates_images_filter_tree"
      ["MiqTemplate", _('All Templates & Images')]
    when "templates_filter_tree"
      ["ManageIQ::Providers::InfraManager::Template", _('All Templates')]
    when "vms_filter_tree"
      ["ManageIQ::Providers::InfraManager::Vm", _('All VMs')]
    else
      [nil, _('All VMs & Templates')]
    end
  end

  def scopes_for_role
    named_scope = []
    named_scope << :not_orphaned unless role_allows?(:feature => 'vm_show_list_orphaned')
    named_scope << :not_archived unless role_allows?(:feature => 'vm_show_list_archived')
    named_scope << :not_retired unless role_allows?(:feature => 'vm_show_list_retired')
    named_scope
  end

  def list_child_vms(model, node_id, title, show_list)
    options = {
      :model       => model,
      :named_scope => scopes_for_role,
    }
    options[:named_scope] << :without_volume_templates if model == "ManageIQ::Providers::CloudManager::Template"

    if x_node == "root"
      if x_active_tree == :vandt_tree
        klass = ManageIQ::Providers::InfraManager::VmOrTemplate
        options[:named_scope] << [:with_type, klass.vm_descendants.collect(&:name)]
      end
      process_show_list(options) if show_list # Get all VMs & Templates
      @right_cell_text = title
    elsif TreeBuilder.get_model_for_prefix(@nodetype) == "Hash"
      if x_active_tree == :vandt_tree
        klass = ManageIQ::Providers::InfraManager::VmOrTemplate
        options[:named_scope] << [:with_type, klass.vm_descendants.collect(&:name)]

      end
      if node_id == "orph"
        options[:named_scope] << :orphaned
        process_show_list(options) if show_list
        @right_cell_text = if model
                             _("Orphaned %{models}") % {:models => ui_lookup(:models => model)}
                           else
                             _("Orphaned VMs & Templates")
                           end
      elsif node_id == "arch"
        options[:named_scope] << :archived
        process_show_list(options) if show_list
        @right_cell_text = if model
                             _("Archived %{models}") % {:models => ui_lookup(:models => model)}
                           else
                             _("Archived VMs & Templates")
                           end
      end
    elsif TreeBuilder.get_model_for_prefix(@nodetype) == "MiqSearch"
      process_show_list(options) if show_list # Get all VMs & Templates
      @right_cell_text = if model
                           _("All %{models}") % {:models => ui_lookup(:models => model)}
                         else
                           _("All VMs & Templates")
                         end
    else
      rec = TreeBuilder.get_model_for_prefix(@nodetype).constantize.find(node_id)
      options[:association] = @nodetype == 'az' ? 'vms' : 'all_vms_and_templates'
      options[:parent] = rec
      options[:named_scope] << :active

      process_show_list(options) if show_list
      model_name = @nodetype == "d" ? _("Datacenter") : ui_lookup(:model => rec.class.base_class.to_s)
      @right_cell_text = _("%{object_types} under %{datastore_or_provider} \"%{provider_or_datastore_name}\"") % {
        :object_types               => model ? ui_lookup(:models => model) : _("VMs & Templates"),
        :datastore_or_provider      => model_name,
        :provider_or_datastore_name => rec.name
      }
    end
    # Add adv search filter to header
    @right_cell_text += @edit[:adv_search_applied][:text] if @edit && @edit[:adv_search_applied]

    # save model being displayed for custom buttons
    @tree_selected_model = model.present? && model.constantize

    options # is this used anywhere?
  end

  # Get all info for the node about to be displayed
  def get_node_info(treenodeid, show_list = true)
    # resetting action that was stored during edit to determine what is being edited
    @sb[:action] = nil

    @nodetype, node_id =
      if %w[v t].include?(treenodeid.split('-')[0])
        @sb[@sb[:active_accord]] = treenodeid
        parse_nodetype_and_id(treenodeid)
      else
        @sb[@sb[:active_accord]] = nil
        parse_nodetype_and_id(valid_active_node(treenodeid))
      end

    model, title = tree_name_to_model_and_title(x_active_tree.to_s)

    if %w[Vm MiqTemplate].include?(TreeBuilder.get_model_for_prefix(@nodetype))
      # VM or Template record, show the record
      show_record(node_id)
      if @record.nil?
        self.x_node = "root"
        get_node_info("root")
        return
      else
        if action_name == "explorer"
          @breadcrumbs.clear
          drop_breadcrumb({:name => breadcrumb_name(model), :url => "/#{controller_name}/explorer"}, false)
        end
        @right_cell_text = _("%{model} \"%{name}\"") % {:name => @record.name, :model => ui_lookup(:model => model && model != "VmOrTemplate" ? model : TreeBuilder.get_model_for_prefix(@nodetype)).to_s}
      end
    else # Get list of child VMs of this node
      options = list_child_vms(model, node_id, title, show_list)

      # After adding to history, add name filter suffix if showing a list
      if @search_text.present? && !@in_a_form
        @right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text}
      end
    end

    options # is this used anywhere?
  end

  # Replace the right cell of the explorer
  def replace_right_cell(options = {})
    if params[:action] == 'x_history'
      # Making selected checkboxes array empty when compare cancel is clicked
      params[:miq_grid_checks] = []
    end

    action, presenter, refresh_breadcrumbs = options.values_at(:action, :presenter, :refresh_breadcrumbs)
    refresh_breadcrumbs = true unless options.key?(:refresh_breadcrumbs)

    @explorer = true
    @sb[:action] = action unless action.nil?
    if @sb[:action] || params[:display]
      partial, action, @right_cell_text, options_from_right_cell = set_right_cell_vars(options) # Set partial name, action and cell header
    end

    if !@in_a_form && !@sb[:action]
      id = @record.present? ? TreeBuilder.build_node_id(@record) : x_node
      id = @sb[@sb[:active_accord]] if @sb[@sb[:active_accord]].present? && params[:action] != 'tree_select'
      get_node_info(id)
      type, _id = parse_nodetype_and_id(id)
      # set @delete_node since we don't rebuild vm tree
      @delete_node = params[:id] if @replace_trees  # get_node_info might set this

      record_showing = type && %w[Vm MiqTemplate].include?(TreeBuilder.get_model_for_prefix(type))
      c_tb = build_toolbar(center_toolbar_filename) # Use vm or template tb
      if record_showing
        cb_tb = build_toolbar(Mixins::CustomButtons::Result.new(:single))
        v_tb = build_toolbar("x_summary_view_tb")
      else
        cb_tb = build_toolbar(Mixins::CustomButtons::Result.new(:list))
        v_tb = build_toolbar("download_view_tb")
      end
    elsif %w[compare drift].include?(@sb[:action])
      @in_a_form = true # Turn on Cancel button
      c_tb = build_toolbar("#{@sb[:action]}_center_tb")
      v_tb = build_toolbar("#{@sb[:action]}_view_tb")
    elsif @sb[:action] == "performance"
      c_tb = build_toolbar("x_vm_performance_tb")
    elsif @sb[:action] == "drift_history"
      c_tb = build_toolbar("drifts_center_tb") # Use vm or template tb
    elsif @sb[:action] == 'snapshot_info'
      c_tb = build_toolbar("x_vm_snapshot_center_tb")
    elsif @sb[:action] == 'right_size'
      v_tb = build_toolbar("right_size_view_tb")
    elsif @sb[:action] == 'vmtree_info'
      c_tb = build_toolbar("x_vm_vmtree_center_tb")
    end

    # Build presenter to render the JS command for the tree update
    presenter ||= ExplorerPresenter.new(
      :active_tree => x_active_tree,
      :delete_node => @delete_node # Remove a new node from the tree
    )

    presenter.show(:default_left_cell).hide(:custom_left_cell)

    add_ajax = false
    if record_showing
      presenter.hide(:form_buttons_div)
      presenter.update(:main_div, r[:partial => "layouts/textual_groups_generic"])
    elsif @in_a_form
      partial_locals = {:controller => 'vm'}
      partial_locals[:action_url] = @lastaction if partial == 'layouts/x_gtl'
      partial_locals.merge!(options_from_right_cell)
      presenter.update(:main_div, r[:partial => partial, :locals => partial_locals])

      locals = {:action_url => action, :record_id => @record.try(:id)}
      if %w[clone migrate miq_request_new pre_prov publish add_security_group remove_security_group
            reconfigure resize live_migrate attach detach evacuate
            associate_floating_ip disassociate_floating_ip].include?(@sb[:action])
        locals[:no_reset]        = true                              # don't need reset button on the screen
        locals[:submit_button]   = @sb[:action] != 'miq_request_new' # need submit button on the screen
        locals[:continue_button] = @sb[:action] == 'miq_request_new' # need continue button on the screen
        update_buttons(locals) if @edit && @edit[:buttons].present?
      end

      if ['snapshot_add'].include?(@sb[:action])
        locals[:no_reset]      = true
        locals[:create_button] = true
      end

      locals[:action_url] = nil if ['chargeback'].include?(@sb[:action])

      if %w[ownership protect reconfigure retire tag].include?(@sb[:action])
        locals[:multi_record] = true # need save/cancel buttons on edit screen even tho @record.id is not there
        locals[:record_id]    = @sb[:rec_id] || @edit[:object_ids][0] if @sb[:action] == "tag"
        unless %w[ownership retire].include?(@sb[:action])
          presenter[:build_calendar] = {
            :date_from => Time.zone.now,
            :date_to   => nil,
          }
        end
      end

      add_ajax = true

      if %w[compare drift].include?(@sb[:action])
        presenter.update(:custom_left_cell, r[
          :partial => 'layouts/listnav/x_compare_sections', :locals => {:truncate_length => 23}])
        presenter.show(:custom_left_cell).hide(:default_left_cell)
      end
    elsif @sb[:action] || params[:display]
      partial_locals = { :controller => 'vm' }
      if partial == 'layouts/x_gtl'
        partial_locals[:action_url] = @lastaction

        # Set parent record id & class for JS function miqGridSort to build URL
        presenter[:parent_id]    = @record.id
        presenter[:parent_class] = params[:controller]
      end
      presenter.update(:main_div, r[:partial => partial, :locals => partial_locals])

      add_ajax = true
      presenter[:build_calendar] = true
    else
      presenter.update(:main_div, r[:partial => 'layouts/x_gtl'])
    end

    if add_ajax && %w[performance timeline].include?(@sb[:action])
      presenter[:ajax_action] = {
        :controller => request.parameters["controller"],
        :action     => @ajax_action,
        :record_id  => @record.id
      }
    end

    replace_search_box(presenter, :nameonly => %i[images_tree instances_tree vandt_tree].include?(x_active_tree))

    if @sb[:action] == "policy_sim"
      presenter[:clear_tree_cookies] = "edit_treeOpenStatex"
      presenter[:tree_expand_all] = false
    end

    # Handle bottom cell
    if @pages || @in_a_form
      if @pages && !@in_a_form
        presenter.hide(:form_buttons_div)
      elsif @in_a_form
        # these subviews use angular, so they need to use a special partial
        # so the form buttons on the outer frame can be updated.
        if @sb[:action] == 'dialog_provision'
          if show_old_dialog_submit_and_cancel_buttons?(params)
            presenter.update(:form_buttons_div, r[
              :partial => 'layouts/x_dialog_buttons',
              :locals  => {
                :action_url => action,
                :record_id  => @edit[:rec_id],
              }
            ])
          else
            presenter.update(:form_buttons_div, '')
            presenter.remove_paging.hide(:form_buttons_div)
          end
        elsif @sb[:action] == 'rename'
          presenter.hide(:form_buttons_div)
        elsif %w[chargeback reconfigure_update retire].exclude?(action) && !hide_x_edit_buttons(action)
          presenter.update(:form_buttons_div, r[:partial => 'layouts/x_edit_buttons', :locals => locals])
        end

        if %w[pre_prov].include?(action)
          presenter.update(:pre_prov_form_buttons_div, r[:partial => 'layouts/x_edit_buttons', :locals => locals])
        end

        # Make sure the form_buttons_div is empty.
        # it would remain on the screen if prior to retire some action that uses the form_buttons_div was used
        # such as "edit tags" or "manage policies".
        presenter.update(:form_buttons_div, '') if action == "retire" || hide_x_edit_buttons(action)

        presenter.remove_paging.show(:form_buttons_div)

        # evm_relationship_update uses React form and buttons
        presenter.hide(:form_buttons_div) if action == "evm_relationship_update"
      end

      if %w[add_security_group associate_floating_ip attach detach disassociate_floating_ip evacuate live_migrate ownership remove_security_group resize].include?(@sb[:action])
        presenter.hide(:form_buttons_div, :paging_div)
      else
        presenter.show(:paging_div)
      end
    else
      presenter.hide(:paging_div)
    end

    presenter[:right_cell_text] = @right_cell_text

    presenter.reload_toolbars(:center => c_tb, :custom => cb_tb, :view => v_tb)

    presenter.set_visibility(c_tb.present? || v_tb.present?, :toolbar)

    presenter[:record_id] = @record.try(:id)

    # Hide/show searchbox depending on if a list is showing
    presenter.set_visibility(!(@record || @in_a_form), :adv_searchbox_div)
    presenter[:clear_search_toggle] = clear_search_status

    presenter[:osf_node] = x_node # Open, select, and focus on this node

    presenter.hide(:blocker_div) unless @edit && @edit[:adv_search_open]
    presenter[:hide_modal] = true
    presenter[:lock_sidebar] = @in_a_form && @edit

    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs']) if refresh_breadcrumbs

    render :json => presenter.for_render
  end

  def show_old_dialog_submit_and_cancel_buttons?(params)
    %w[vm_transform vm_transform_mass].include?(params[:pressed])
  end

  # get the host that this vm belongs to
  def get_host_for_vm(vm)
    if vm.host
      @hosts = []
      @hosts.push(vm.host)
    end
  end

  def action_type(type, amount)
    case type
    when "advanced_settings"
      n_("Advanced Setting", "Advanced Settings", amount)
    when "disks"
      n_("Number of Disk", "Number of Disks", amount)
    when "drift_history"
      n_("Drift History", "Drift History", amount)
    when "event_logs"
      n_("Event Log", "Event Logs", amount)
    when "filesystem_drivers"
      n_("Filesystem Driver", "Filesystem Drivers", amount)
    when "filesystems"
      n_("Filesystem", "Filesystems", amount)
    when "groups"
      n_("Group", "Groups", amount)
    when "guest_applications"
      n_("Guest Application", "Guest Applications", amount)
    when "hv_info"
      n_("Container", "Container", amount)
    when "kernel_drivers"
      n_("Kernel Driver", "Kernel Drivers", amount)
    when "linux_initprocesses"
      n_("Init Process", "Init Processes", amount)
    when "os_info"
      n_("OS Info", "OS Info", amount)
    when "parent_vm"
      n_("Parent VM", "Parent VM", amount)
    when "patches"
      n_("Patch", "Patches", amount)
    when "processes"
      n_("Running Process", "Running Processes", amount)
    when "registry_items"
      n_("Registry Item", "Registry Items", amount)
    when "resources_info"
      n_("Resource", "Resources", amount)
    when "scan_history"
      n_("Scan History", "Scan History", amount)
    when "snapshot_info"
      n_("Snapshot", "Snapshots", amount)
    when "users"
      n_("User", "Users", amount)
    when "vmtree_info"
      n_("Genealogy", "Genealogy", amount)
    when "win32_services"
      n_("Win32 Service", "Win32 Services", amount)
    else
      amount > 1 ? type.titleize : type.titleize.singularize
    end
  end

  # set partial name and cell header for edit screens
  def set_right_cell_vars(options = {})
    name = @record.try(:name).to_s
    table = request.parameters["controller"]
    case @sb[:action]
    when "attach"
      partial = "vm_common/attach"
      header = _("Attach Cloud Volume to %{model} \"%{name}\"") % {:name => name, :model => ui_lookup(:table => table)}
      action = "attach_volume"
    when "detach"
      partial = "vm_common/detach"
      header = _("Detach Cloud Volume from %{model} \"%{name}\"") % {
        :name  => name,
        :model => ui_lookup(:table => table)
      }
      action = "detach_volume"
    when "compare", "drift"
      partial = "layouts/compare"
      header = if @sb[:action] == "compare"
                 _("Compare %{vm_or_template}") % {:vm_or_template => ui_lookup(:model => @sb[:compare_db])}
               else
                 _("Drift for %{vm_or_template} \"%{name}\"") % {:name => name, :vm_or_template => ui_lookup(:model => @sb[:compare_db])}
               end
      action = nil
    when "live_migrate"
      partial = "vm_common/live_migrate"
      header = _("Live Migrating %{models}") % {:models => ui_lookup(:tables => table)}
      action = "live_migrate_vm"
    when "evacuate"
      partial = "vm_common/evacuate"
      header = _("Evacuating %{models}") % {:models => ui_lookup(:tables => table)}
      action = "evacuate_vm"
    when "associate_floating_ip"
      partial = "vm_common/associate_floating_ip"
      header = _("Associating Floating IP with %{model} \"%{name}\"") % {
        :name => name, :model => ui_lookup(:table => table)
      }
      action = "associate_floating_ip_vm"
    when "disassociate_floating_ip"
      partial = "vm_common/disassociate_floating_ip"
      header = _("Disassociating Floating IP from %{model} \"%{name}\"") % {
        :name => name, :model => ui_lookup(:table => table)
      }
      action = "disassociate_floating_ip_vm"
    when "add_security_group"
      partial = "vm_common/add_security_group"
      header = _("Add Security Group to %{model} \"%{name}\"") % {
        :name => name, :model => ui_lookup(:table => table)
      }
      action = "add_security_group"
    when "remove_security_group"
      partial = "vm_common/remove_security_group"
      header = _("Remove Security Group from %{model} \"%{name}\"") % {
        :name => name, :model => ui_lookup(:table => table)
      }
      action = "remove_security_group"
    when "clone", "migrate", "publish"
      partial = "miq_request/prov_edit"
      task_headers = {"clone"   => _("Clone %{vm_or_template}"),
                      "migrate" => _("Migrate %{vm_or_template}"),
                      "publish" => _("Publish %{vm_or_template}")}
      header = task_headers[@sb[:action]] % {:vm_or_template => ui_lookup(:table => table)}
      action = "prov_edit"
    when "dialog_provision"
      partial = "shared/dialogs/dialog_provision"
      header = @right_cell_text
      action = "dialog_form_button_pressed"
      locals = options[:dialog_locals]
    when "edit"
      partial = "vm_common/form"
      header = _("Editing %{vm_or_template} \"%{name}\"") % {:name => name, :vm_or_template => model_for_vm(@record).display_name}
    when 'chargeback'
      partial = @refresh_partial
      header = _('Chargeback preview for "%{vm_name}"') % { :vm_name => name }
      action = 'vm_chargeback'
      @in_a_form = true
      @edit = {}
    when "evm_relationship"
      partial = "vm_common/evm_relationship"
      header = _("Edit %{product} Server Relationship for %{vm_or_template} \"%{name}\"") % {:vm_or_template => ui_lookup(:table => table),
                                                                                             :name           => name,
                                                                                             :product        => Vmdb::Appliance.PRODUCT_NAME}
      action = nil
    when "miq_request_new"
      partial = "miq_request/pre_prov"
      header = if request.parameters[:controller] == "vm_cloud"
                 _("Provision Instances - Select an Image")
               else
                 _("Provision Virtual Machines - Select a Template")
               end
      action = "pre_prov"
    when "pre_prov"
      partial = "miq_request/prov_edit"
      header = _("Provision %{vms_or_templates}") % {:vms_or_templates => ui_lookup(:tables => table)}
      action = "pre_prov_continue"
    when "pre_prov_continue"
      partial = "miq_request/prov_edit"
      header = _("Provision %{vms_or_templates}") % {:vms_or_templates => ui_lookup(:tables => table)}
      action = "prov_edit"
    when "ownership"
      partial = "shared/views/ownership"
      header = header_for_ownership
      action = "ownership_update"
    when "performance"
      partial = "layouts/performance"
      header = _("Capacity & Utilization data for %{vm_or_template} \"%{name}\"") % {:vm_or_template => ui_lookup(:table => table), :name => name}
      action = nil
    when "policy_sim"
      action = nil
      header = _("%{vm_or_template} Policy Simulation") % {:vm_or_template => ui_lookup(:table => vm_or_instance(@record))}
      partial = params[:action] == "policies" ? "vm_common/policies" : "layouts/policy_sim"
    when "protect"
      partial = "layouts/protect"
      header = _("%{vm_or_template} Policy Assignment") % {:vm_or_template => ui_lookup(:table => table)}
      action = "protect"
    when "reconfigure"
      partial = "vm_common/reconfigure"
      header = _("Reconfigure %{vm_or_template}") % {:vm_or_template => ui_lookup(:table => table)}
      action = "reconfigure_update"
    when "rename"
      partial = 'vm_common/rename'
      header = _("Renaming VM \"%{name}\"") % {:name => name}
      action = 'rename_vm'
    when "resize"
      partial = "vm_common/resize"
      header = _("Reconfiguring %{vm_or_template} \"%{name}\"") % {:vm_or_template => ui_lookup(:table => table), :name => name}
      action = "resize_vm"
    when "retire"
      partial = "shared/views/retire"
      header = _("Set/Remove retirement date for %{vm_or_template}") % {:vm_or_template => ui_lookup(:table => table)}
      action = "retire"
    when "right_size"
      partial = "vm_common/right_size"
      header = _("Right Size Recommendation for %{vm_or_template} \"%{name}\"") % {:vm_or_template => ui_lookup(:table => table), :name => name}
      action = nil
    when "tag"
      partial = "layouts/tagging"
      header = _("Edit Tags for %{vm_or_template}") % {:vm_or_template => ui_lookup(:table => table)}
      action = "tagging_edit"
    when "snapshot_add"
      partial = "vm_common/snap"
      header = _("Adding a new Snapshot")
      action = "snap_vm"
    when "timeline"
      partial = "layouts/tl_show"
      header = _("Timelines for %{virtual_machine} \"%{name}\"") % {:virtual_machine => ui_lookup(:table => table), :name => name}
      action = nil
    else
      # now take care of links on summary screen
      partial = if @showtype == "details"
                  "layouts/x_gtl"
                elsif @showtype == "item"
                  "layouts/item"
                elsif @showtype == "drift_history"
                  "layouts/#{@showtype}"
                else
                  "#{@showtype == "compliance_history" ? "shared/views" : "vm_common"}/#{@showtype}"
                end
      if @showtype == "item"
        header = _("%{action} \"%{item_name}\" for %{vm_or_template} \"%{name}\"") % {
          :vm_or_template => ui_lookup(:table => table),
          :name           => name,
          :item_name      => @item.kind_of?(ScanHistory) ? @item.started_on.to_s : @item.name,
          :action         => action_type(@sb[:action], 1)
        }
      else
        header = _("\"%{action}\" for %{vm_or_template} \"%{name}\"") % {
          :vm_or_template => ui_lookup(:table => table),
          :name           => name,
          :action         => action_type(@sb[:action], 2)
        }
      end
      action = nil
    end
    locals ||= {}
    return partial, action, header, locals
  end

  def update_buttons(locals)
    locals[:continue_button] = locals[:submit_button] = false
    locals[:continue_button] = true if @edit[:buttons].include?(:continue)
    locals[:submit_button] = true if @edit[:buttons].include?(:submit)
  end

  def breadcrumb_prohibited_for_action?
    !%w[accordion_select explorer tree_select].include?(action_name)
  end

  def gtl_url
    "/show"
  end
end
