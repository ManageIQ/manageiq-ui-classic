module VmCommon
  extend ActiveSupport::Concern
  include ActionView::Helpers::JavaScriptHelper
  include ChargebackPreview

  def textual_group_list
    [
      %i(properties lifecycle relationships vmsafe normal_operating_ranges miq_custom_attributes ems_custom_attributes),
      %i(compliance power_management security configuration datastore_allocation datastore_usage diagnostics tags)
    ]
  end

  included do
    private :textual_group_list
    helper_method :textual_group_list
    helper_method :parent_choices_with_no_parent_choice
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit]                                  # Restore @edit for adv search box
    params[:page] = @current_page unless @current_page.nil?   # Save current page for list refresh
    @refresh_div = "main_div" # Default div for button.rjs to refresh

    case params[:pressed]
    when 'custom_button'
      custom_buttons
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
    else    # Figure out what was showing to refresh it
      if @lastaction == "show" && ["vmtree"].include?(@showtype)
        @refresh_partial = @showtype
      elsif @lastaction == "show" && ["config"].include?(@showtype)
        @refresh_partial = @showtype
      elsif @lastaction == "show_list"
        # default to the gtl_type already set
      else
        @refresh_partial = "layouts/flash_msg"
        @refresh_div = "flash_msg_div"
      end
    end
    @vm = @record = identify_record(params[:id], VmOrTemplate) unless @lastaction == "show_list"

    if single_delete_test(true)
      single_delete_redirect
    elsif params[:pressed].ends_with?("_edit")
      if @redirect_controller
        javascript_redirect :controller => @redirect_controller, :action => @refresh_partial, :id => @redirect_id, :org_controller => @org_controller
      else
        javascript_redirect :action => @refresh_partial, :id => @redirect_id
      end
    else
      if @refresh_div == "main_div" && @lastaction == "show_list"
        replace_gtl_main_div
      else
        if @refresh_div == "flash_msg_div"
          javascript_flash(:spinner_off => true)
        else
          options
          partial_replace(@refresh_div, "vm_common/#{@refresh_partial}")
        end
      end
    end
  end

  # to reload currently displayed summary screen in explorer
  def reload
    @_params[:id] = if hide_vms && x_node.split('-')[1] != to_cid(params[:id]) && params[:id].present?
                      'v-' + to_cid(params[:id])
                    else
                      x_node
                    end
    tree_select
  end

  def show_timeline
    db = get_rec_cls
    @display = "timeline"
    session[:tl_record_id] = params[:id] if params[:id]
    @record = find_record_with_rbac(db, from_cid(session[:tl_record_id]))
    @timeline = @timeline_filter = true
    @lastaction = "show_timeline"
    tl_build_timeline                       # Create the timeline report
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

  def hide_vms
    !User.current_user.settings.fetch_path(:display, :display_vms) # default value is false
  end

  def x_show
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    generic_x_show
  end

  def download_summary_pdf
    super do
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
      referrer = Rails.application.routes.recognize_path(request.referrer)
      redirect_to :controller => referrer[:controller], :action => referrer[:action]
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
        redirect_controller = role_allows?(:feature => "vandt_accord") || role_allows?(:feature => "vms_filter_accord") ?
                                "vm_infra" : nil
      when "vm_cloud"
        redirect_controller = role_allows?(:feature => "instances_accord") || role_allows?(:feature => "instances_filter_accord") ?
                                "vm_cloud" : nil
      end

      redirect_controller = role_allows?(:feature => "vms_instances_filter_accord") ? "vm_or_template" : nil unless redirect_controller

      if redirect_controller
        action = "explorer"
      else
        url = request.env['HTTP_REFERER'].split('/')
        add_flash(_("User '%{username}' is not authorized to access '%{controller_name}'") %
          {:username => current_userid, :controller_name => ui_lookup(:table => controller_name)}, :warning)
        session[:flash_msgs] = @flash_array.dup
        redirect_controller  = url[3]
        action               = url[4]
      end

      redirect_to :controller => redirect_controller,
                  :action     => action
      return
    end

    if @record.class.base_model.to_s == "MiqTemplate"
      rec_cls = "miq_template"
    else
      rec_cls = "vm"
    end
    @gtl_url = "/show"
    if %w(main summary_only).include?(@display)
      get_tagdata(@record)
      drop_breadcrumb({:name => _("Virtual Machines"),
                       :url  => "/#{rec_cls}/show_list?page=#{@current_page}&refresh=y"}, true)
      drop_breadcrumb(:name => @record.name + _(" (Summary)"), :url => "/#{rec_cls}/show/#{@record.id}")
      @showtype = "main"
      @button_group = rec_cls
      set_summary_pdf_data if @display == "summary_only"
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
      @snapshot_tree = TreeBuilderSnapshots.new(:snapshot_tree, :snapshot, @sb, true, :root => @record)
      @active = if @snapshot_tree.selected_node
                  snap_selected = Snapshot.find_by_id(from_cid(@snapshot_tree.selected_node.split('-').last))
                  session[:snap_selected] = snap_selected.id
                  snap_selected.current?
                else
                  false
                end
      @button_group = "snapshot"
    elsif @display == "devices"
      drop_breadcrumb(:name => @record.name + _(" (Devices)"),
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
    elsif @display == "vmtree_info"
      drop_breadcrumb({:name => @record.name, :url => "/#{rec_cls}/show/#{@record.id}"}, true)
      drop_breadcrumb(:name => @record.name + _(" (Genealogy)"),
                      :url  => "/#{rec_cls}/show/#{@record.id}?display=#{@display}")
      if @record.parents.length > 1
        add_flash(_("VM has too many parents."), :error)
        javascript_flash(:spinner_off => true)
        return
      else
        @genealogy_tree = TreeBuilderGenealogy.new(:genealogy_tree, :genealogy, @sb, true, @record)
        session[:genealogy_tree_root_id] = @genealogy_tree.root_id
      end
      @button_group = "vmtree"
    elsif @display == "compliance_history"
      count = params[:count] ? params[:count].to_i : 10
      @ch_tree = TreeBuilderComplianceHistory.new(:ch_tree, :ch, @sb, true, @record)
      session[:ch_tree] = @ch_tree.tree_nodes
      session[:tree_name] = "ch_tree"
      session[:squash_open] = (count == 1)
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
      perf_gen_init_options               # Initialize perf chart options, charts will be generated async
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
    id == 'root' ? session[:genealogy_tree_root_id] : from_cid(parse_nodetype_and_id(id).last)
  end

  def genealogy_tree_selected
    base = node_id(params[:id])
    @display = "vmtree_info"
    javascript_redirect :action => "show", :id => base, :vm_tree => "vmtree_info"
  end

  def snap_pressed
    session[:snap_selected] = from_cid(params[:id])
    @snap_selected = Snapshot.find_by_id(session[:snap_selected])
    @vm = @record = identify_record(x_node_right_cell.split('-').last, VmOrTemplate)
    if @snap_selected.nil?
      @display = "snapshot_info"
      add_flash(_("Last selected Snapshot no longer exists"), :error)
    end
    @snapshot_tree = TreeBuilderSnapshots.new(:snapshot_tree,
                                              :snapshot,
                                              @sb,
                                              true,
                                              :root          => @record,
                                              :selected_node => session[:snap_selected])
    @active = @snap_selected.current? if @snap_selected
    @button_group = "snapshot"
    @explorer = true
    render :update do |page|
      page << javascript_prologue
      page << javascript_reload_toolbars

      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page.replace("desc_content", :partial => "/vm_common/snapshots_desc",
                                   :locals  => {:selected => params[:id]})
    end
  end

  def disks
  end

  def processes
    show_association('processes', _('Running Processes'), 'processes', [:operating_system, :processes], OsProcess,
                     'processes')
  end

  def registry_items
    show_association('registry_items', _('Registry Entries'), 'registry_items', :registry_items, RegistryItem)
  end

  def advanced_settings
    show_association('advanced_settings', _('Advanced Settings'), 'advancedsetting', :advanced_settings,
                     AdvancedSetting)
  end

  def linux_initprocesses
    show_association('linux_initprocesses', _('Init Processes'), 'linuxinitprocesses', :linux_initprocesses,
                     SystemService, 'linux_initprocesses')
  end

  def win32_services
    show_association('win32_services', _('Win32 Services'), 'win32service', :win32_services, SystemService,
                     'win32_services')
  end

  def kernel_drivers
    show_association('kernel_drivers', _('Kernel Drivers'), 'kerneldriver', :kernel_drivers, SystemService,
                     'kernel_drivers')
  end

  def filesystem_drivers
    show_association('filesystem_drivers', _('File System Drivers'), 'filesystemdriver', :filesystem_drivers,
                     SystemService, 'filesystem_drivers')
  end

  def filesystems
    show_association('filesystems', _('Files'), 'filesystems', :filesystems, Filesystem)
  end

  def security_groups
    show_association('security_groups', _('Security Groups'), 'security_group', :security_groups, SecurityGroup)
  end

  def floating_ips
    show_association('floating_ips', _('Floating IPs'), 'floating_ip', :floating_ips, FloatingIp)
  end

  def cloud_subnets
    show_association('cloud_subnets', _('Subnets'), 'cloud_subnet', :cloud_subnets, CloudSubnet)
  end

  def cloud_networks
    show_association('cloud_subnets', _('Networks'), 'cloud_subnet', :cloud_subnets, CloudNetwork)
  end

  def cloud_volumes
    show_association('cloud_volumes', _('Cloud Volumes'), 'cloud_volume', :cloud_volumes, CloudVolume)
  end

  def network_routers
    show_association('network_routers', _('Routers'), 'network_router', :network_routers, NetworkRouter)
  end

  def network_ports
    show_association('network_ports', _('Ports'), 'network_port', :network_ports, NetworkPort)
  end

  def load_balancers
    show_association('load_balancers', _('Load Balancers'), 'load_balancer', :load_balancers, LoadBalancer)
  end

  def snap
    assert_privileges(params[:pressed])
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    @name = @description = ""
    @in_a_form = true
    @button_group = "snap"
    @show_snapshot_memory_checkbox = show_snapshot_memory_checkbox?(@vm)
    drop_breadcrumb(:name    => _("Snapshot VM '%{name}''") % {:name => @record.name},
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

  def show_snapshot_memory_checkbox?(vm)
    return true unless vm.respond_to?(:snapshotting_memory_allowed?)
    vm.snapshotting_memory_allowed?
  end

  def snap_vm
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    if params["cancel"] || params[:button] == "cancel"
      flash = _("Snapshot of VM %{name} was cancelled by the user") % {:name => @record.name}
      if session[:edit] && session[:edit][:explorer]
        add_flash(flash)
        @_params[:display] = "snapshot_info"
        show
      else
        redirect_to :action => @lastaction, :id => @record.id, :flash_msg => flash
      end
    elsif params["create.x"] || params[:button] == "create"
      @name = params[:name]
      @description = params[:description]
      if params[:name].blank? && !@record.try(:snapshot_name_optional?)
        render_missing_field(session, "Name")
      elsif params[:description].blank? && @record.try(:snapshot_description_required?)
        render_missing_field(session, "Description")
      else
        flash_error = false
        #       audit = {:event=>"vm_genealogy_change", :target_id=>@record.id, :target_class=>@record.class.base_class.name, :userid => session[:userid]}
        begin
          # @record.create_snapshot(params[:name], params[:description], params[:snap_memory])
          Vm.process_tasks(:ids         => [@record.id],
                           :task        => "create_snapshot",
                           :userid      => session[:userid],
                           :name        => params[:name],
                           :description => params[:description],
                           :memory      => params[:snap_memory] == "1")
        rescue => bang
          puts bang.backtrace.join("\n")
          flash = _("Error during 'Create Snapshot': %{message}") % {:message => bang.message}
          flash_error = true
        #         AuditEvent.failure(audit.merge(:message=>"[#{@record.name} -- #{@record.location}] Update returned: #{bang}"))
        else
          flash = _("Create Snapshot for %{model} \"%{name}\" was started") % {:model => ui_lookup(:model => "Vm"), :name => @record.name}
          #         AuditEvent.success(build_saved_vm_audit(@record))
        end
        params[:id] = @record.id.to_s   # reset id in params for show
        # params[:display] = "snapshot_info"
        if session[:edit] && session[:edit][:explorer]
          add_flash(flash, flash_error ? :error : :success)
          @_params[:display] = "snapshot_info"
          show
        else
          redirect_to :action => @lastaction, :id => @record.id, :flash_msg => flash, :flash_error => flash_error, :display => "snapshot_info"
        end
      end
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
                                                              :policy_simulation,
                                                              @sb,
                                                              true,
                                                              :root      => @polArr,
                                                              :root_name => @record.name,
                                                              :options   => @policy_options)
    @edit = session[:edit] if session[:edit]
    if @edit && @edit[:explorer]
      if session[:policies].empty?
        render_flash(_("No policies were selected for Policy Simulation."), :error)
        return
      end
      @in_a_form = true
      replace_right_cell(:action => 'policy_sim')
    else
      render :template => 'vm/show'
    end
  end

  def policy_show_options
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
                                                              :policy_simulation,
                                                              @sb,
                                                              true,
                                                              :root      => @polArr,
                                                              :root_name => @record.name,
                                                              :options   => @policy_options)
    replace_main_div({:partial => "vm_common/policies"}, {:flash => true})
  end

  # Show/Unshow out of scope items
  def policy_options
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    @policy_options ||= {}
    @policy_options[:out_of_scope] = (params[:out_of_scope] == "1")
    @policy_simulation_tree = TreeBuilderPolicySimulation.new(:policy_simulation_tree,
                                                              :policy_simulation,
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
      javascript_prologue( previous_breadcrumb_url)
    end
    if !@explorer && params[:button] != "back"
      drop_breadcrumb(:name => _("Right Size VM '%{name}''") % {:name => @record.name}, :url => "/vm/right_size")
      render :action => "show"
    end
  end

  def evm_relationship
    @record = find_record_with_rbac(VmOrTemplate, params[:id])  # Set the VM object
    @edit = {}
    @edit[:vm_id] = @record.id
    @edit[:key] = "evm_relationship_edit__new"
    @edit[:current] = {}
    @edit[:new] = {}
    evm_relationship_build_screen
    @edit[:current] = copy_hash(@edit[:new])
    session[:changed] = false

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

  # Build the evm_relationship assignment screen
  def evm_relationship_build_screen
    @servers = {}   # Users array for first chooser
    MiqServer.all.each { |s| @servers["#{s.name} (#{s.id})"] = s.id.to_s }
    @edit[:new][:server] = @record.miq_server ? @record.miq_server.id.to_s : nil            # Set to first category, if not already set
  end

  def evm_relationship_field_changed
    return unless load_edit("evm_relationship_edit__new")
    evm_relationship_get_form_vars
    changed = (@edit[:new] != @edit[:current])
    render :update do |page|
      page << javascript_prologue
      page << javascript_for_miq_button_visibility(changed)
    end
  end

  def evm_relationship_get_form_vars
    @record = VmOrTemplate.find_by_id(@edit[:vm_id])
    @edit[:new][:server] = params[:server_id] == "" ? nil : params[:server_id] if params[:server_id]
  end

  def evm_relationship_update
    return unless load_edit("evm_relationship_edit__new")
    evm_relationship_get_form_vars
    case params[:button]
    when "cancel"
      msg = _("Edit Management Engine Relationship was cancelled by the user")
      if @edit[:explorer]
        add_flash(msg)
        @sb[:action] = nil
        replace_right_cell
      else
        javascript_redirect :action => 'show', :id => @record.id, :flash_msg => msg
      end
    when "save"
      svr = @edit[:new][:server] && @edit[:new][:server] != "" ? MiqServer.find(@edit[:new][:server]) : nil
      @record.miq_server = svr
      @record.save
      msg = _("Management Engine Relationship saved")
      if @edit[:explorer]
        add_flash(msg)
        @sb[:action] = nil
        replace_right_cell
      else
        javascript_redirect :action => 'show', :id => @record.id, :flash_msg => msg
      end
    when "reset"
      @in_a_form = true
      if @edit[:explorer]
        @explorer = true
        evm_relationship
        add_flash(_("All changes have been reset"), :warning)
        replace_right_cell
      else
        javascript_redirect :action => 'evm_relationship', :id => @record.id, :flash_msg => _("All changes have been reset"), :flash_warning => true, :escape => true
      end
    end
  end

  def delete
    @lastaction = "delete"
    redirect_to :action => 'show_list', :layout => false
  end

  def destroy
    find_record_with_rbac(VmOrTemplate, params[:id]).destroy
    redirect_to :action => 'list'
  end

  def profile_build
    @catinfo ||= {}
    session[:vm].resolve_profiles(session[:policies].keys).each do |policy|
      cat = policy["description"]
      @catinfo[cat] = true unless @catinfo.key?(cat)
    end
  end

  def profile_toggle
    if params[:pressed] == "tag_cat_toggle"
      profile_build
      policy_escaped = j(params[:policy])
      cat            = params[:cat]
      render :update do |page|
        page << javascript_prologue
        if @catinfo[cat]
          @catinfo[cat] = false
          page << javascript_show("cat_#{policy_escaped}_div")
          page << "$('#cat_#{policy_escaped}_icon').prop('src', '#{ActionController::Base.helpers.image_path('tree/compress.png')}');"
        else
          @catinfo[cat] = true # Set squashed = true
          page << javascript_hide("cat_#{policy_escaped}_div")
          page << "$('#cat_#{policy_escaped}_icon').prop('src', '#{ActionController::Base.helpers.image_path('tree/expand.png')}');"
        end
      end
    else
      add_flash(_("Button not yet implemented"), :error)
      javascript_flash(:spinner_off => true)
    end
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
      flash = _("Add VM \"%{name}\" to a Service was cancelled by the user") % {:name => @record.name}
      redirect_to :action => @lastaction, :id => @record.id, :flash_msg => flash
    else
      chosen = params[:chosen_service].to_i
      flash = _("%{model} \"%{name}\" successfully added to Service \"%{to_name}\"") % {:model => ui_lookup(:model => "Vm"), :name => @record.name, :to_name => Service.find(chosen).name}
      begin
        @record.add_to_vsc(Service.find(chosen).name)
      rescue => bang
        flash = _("Error during 'Add VM to service': %{message}") % {:message => bang}
      end
      redirect_to :action => @lastaction, :id => @record.id, :flash_msg => flash
    end
  end

  def remove_service
    assert_privileges(params[:pressed])
    @record = find_record_with_rbac(Vm, params[:id])
    begin
      @vervice_name = Service.find_by_name(@record.location).name
      @record.remove_from_vsc(@vervice_name)
    rescue => bang
      add_flash(_("Error during 'Remove VM from service': %{message}") % {:message => bang.message}, :error)
    else
      add_flash(_("VM successfully removed from service \"%{name}\"") % {:name => @vervice_name})
    end
  end

  def edit
    @record = find_record_with_rbac(VmOrTemplate, params[:id])  # Set the VM object
    set_form_vars
    build_edit_screen
    session[:changed] = false

    @active_tab = "edit"
    @tab_id = @record.id.to_s
    @tabs = [["edit", "Information"]]

    @refresh_partial = "vm_common/form"
  end

  alias_method :image_edit, :edit
  alias_method :instance_edit, :edit
  alias_method :vm_edit, :edit
  alias_method :miq_template_edit, :edit

  def build_edit_screen
    drop_breadcrumb(:name => _("Edit VM '%{name}''") % {:name => @record.name}, :url => "/vm/edit") unless @explorer
    session[:edit] = @edit
    @in_a_form = true
    @active_tab = "edit"
    @tab_id = @record.id.to_s
    @tabs = [["edit", "Information"]]
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def form_field_changed
    return unless load_edit("vm_edit__#{params[:id]}")
    get_form_vars
    changed = (@edit[:new] != @edit[:current])
    render :update do |page|
      page << javascript_prologue
      page.replace_html("main_div",
                        :partial => "vm_common/form") if %w(allright left right).include?(params[:button])
      page << javascript_for_miq_button_visibility(changed) if changed
      page << "miqSparkle(false);"
    end
  end

  def edit_vm
    return unless load_edit("vm_edit__#{params[:id]}")
    # reset @explorer if coming from explorer views
    @explorer = true if @edit[:explorer]
    get_form_vars
    case params[:button]
    when "cancel"
      if @edit[:explorer]
        add_flash(_("Edit of %{model} \"%{name}\" was cancelled by the user") % {:model => ui_lookup(:model => @record.class.base_model.name), :name => @record.name})
        @record = @sb[:action] = nil
        replace_right_cell
      else
        add_flash(_("Edit of %{model} \"%{name}\" was cancelled by the user") % {:model => ui_lookup(:model => "Vm"), :name => @record.name})
        session[:flash_msgs] = @flash_array.dup
        javascript_redirect previous_breadcrumb_url
      end
    when "save"
      if @edit[:new][:parent] != -1 && @edit[:new][:kids].invert.include?(@edit[:new][:parent]) # Check if parent is a kid, if selected
        add_flash(_("Parent VM can not be one of the child VMs"), :error)
        @changed = session[:changed] = (@edit[:new] != @edit[:current])
        build_edit_screen
        if @edit[:explorer]
          replace_right_cell
        else
          render :action => "edit"
        end
      else
        current = @record.parents.length == 0 ? -1 : @record.parents.first.id                             # get current parent id
        chosen = @edit[:new][:parent].to_i                                                          # get the chosen parent id
        @record.custom_1 = @edit[:new][:custom_1]
        @record.description = @edit[:new][:description]                                                 # add vm description
        if current != chosen
          @record.remove_parent(@record.parents.first) unless current == -1                           # Remove existing parent, if there is one
          @record.set_parent(VmOrTemplate.find(chosen)) unless chosen == -1                                   # Set new parent, if one was chosen
        end
        vms = @record.children                                                                                      # Get the VM's child VMs
        kids = @edit[:new][:kids].invert                                                                        # Get the VM ids from the kids list box
        audit = {:event => "vm_genealogy_change", :target_id => @record.id, :target_class => @record.class.base_class.name, :userid => session[:userid]}
        begin
          @record.save!
          vms.each { |v| @record.remove_child(v) unless kids.include?(v.id) }                                # Remove any VMs no longer in the kids list box
          kids.each_key { |k| @record.set_child(VmOrTemplate.find(k)) }                                             # Add all VMs in kids hash, dups will not be re-added
        rescue => bang
          add_flash(_("Error during '%{name} update': %{message}") % {:name    => @record.class.base_model.name,
                                                                      :message => bang.message}, :error)
          AuditEvent.failure(audit.merge(:message => "[#{@record.name} -- #{@record.location}] Update returned: #{bang}"))
        else
          flash = _("%{model} \"%{name}\" was saved") % {:model => ui_lookup(:model => @record.class.base_model.name), :name => @record.name}
          AuditEvent.success(build_saved_vm_audit(@record))
        end
        params[:id] = @record.id.to_s   # reset id in params for show
        @record = nil
        add_flash(flash)
        if @edit[:explorer]
          @sb[:action] = nil
          replace_right_cell
        else
          session[:flash_msgs] = @flash_array.dup
          javascript_redirect previous_breadcrumb_url
        end
      end
    when "reset"
      edit
      add_flash(_("All changes have been reset"), :warning)
      session[:flash_msgs] = @flash_array.dup
      get_vm_child_selection if params["right.x"] || params["left.x"] || params["allright.x"]
      @changed = session[:changed] = false
      build_edit_screen
      if @edit[:explorer]
        replace_right_cell
      else
        javascript_redirect :action => "edit", :controller => "vm", :id => params[:id]
      end
    else
      @changed = session[:changed] = (@edit[:new] != @edit[:current])
      build_edit_screen
      if @edit[:explorer]
        replace_right_cell
      else
        render :action => "edit"
      end
    end
  end

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
    @scan_history  = ScanHistory.find_by_vm_or_template_id(@record.id)
    @listicon = "scan_history"
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
    @scan_history  = ScanHistory.find_by_vm_or_template_id(@record.id)
    if @scan_history.nil?
      redirect_to :action => "scan_history", :flash_msg => _("Error: Record no longer exists in the database"), :flash_error => true
      return
    end
    @lastaction = "scan_histories"
    @sb[:action] = params[:action]
    params[:display] = "scan_histories"
    if !params[:show].nil? || !params[:x_show].nil?
      id = params[:show] ? params[:show] : params[:x_show]
      @item = ScanHistory.find(from_cid(id))
      drop_breadcrumb(:name => time_ago_in_words(@item.started_on.in_time_zone(Time.zone)).titleize, :url => "/vm/scan_history/#{@scan_history.vm_or_template_id}?show=#{@item.id}")
      @view = get_db_view(ScanHistory)          # Instantiate the MIQ Report view object
      show_item
    else
      drop_breadcrumb({:name => time_ago_in_words(@scan_history.started_on.in_time_zone(Time.zone)).titleize, :url => "/vm/show/#{@scan_history.vm_or_template_id}"}, true)
      @listicon = "scan_history"
      show_details(ScanHistory)
    end
  end

  def parent_folder_id(vm)
    if vm.orphaned
      "xx-orph"
    elsif vm.archived
      "xx-arch"
    elsif vm.cloud && vm.template
      TreeBuilder.build_node_cid(vm.ems_id, 'ExtManagementSystem')
    elsif vm.cloud && vm.availability_zone_id.nil?
      TreeBuilder.build_node_cid(vm.ems_id, 'ExtManagementSystem')
    elsif vm.cloud
      TreeBuilder.build_node_cid(vm.availability_zone_id, 'AvailabilityZone')
    elsif (blue_folder = vm.parent_blue_folder) && !blue_folder.hidden
      TreeBuilder.build_node_cid(blue_folder.id, 'EmsFolder')
    elsif vm.ems_id # has no folder parent but is in the tree
      if vm.parent_datacenter
        TreeBuilder.build_node_cid(vm.parent_datacenter.id, 'Datacenter')
      else
        TreeBuilder.build_node_cid(vm.ems_id, 'ExtManagementSystem')
      end

    else
      nil # no selection if VmOrTemplate has no parent
    end
  end

  # Tree node selected in explorer
  def tree_select
    @explorer = true
    @lastaction = "explorer"
    @sb[:action] = nil

    @nodetype, id = parse_nodetype_and_id(params[:id])
    record_requested = %w(Vm MiqTemplate).include?(TreeBuilder.get_model_for_prefix(@nodetype))

    if record_requested && !@record
      @vm = @record = identify_record(id, VmOrTemplate)
    end

    # Handle filtered tree nodes
    if x_active_tree.to_s =~ /_filter_tree$/ && !record_requested

      search_id = @nodetype == "root" ? 0 : from_cid(id)
      adv_search_build(model_from_active_tree(x_active_tree))
      session[:edit] = @edit              # Set because next method will restore @edit from session
      listnav_search_selected(search_id) unless params.key?(:search_text) # Clear or set the adv search filter
      if @edit[:adv_search_applied] &&
         MiqExpression.quick_search?(@edit[:adv_search_applied][:exp]) &&
         %w(reload tree_select).include?(params[:action])
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

    self.x_node = (@record.present? && hide_vms ? parent_folder_id(@record) : params[:id])
    replace_right_cell
  end

  def parent_choices(ids)
    @parent_choices = {}
    @parent_choices[Digest::MD5.hexdigest(ids.inspect)] ||= begin
      parent_item_scope = Rbac.filtered(VmOrTemplate.where.not(:id => ids).order(:name))

      parent_item_scope.pluck(:name, :location, :id).each_with_object({}) do |vm, memo|
        memo[vm[0] + " -- #{vm[1]}"] = vm[2]
      end
    end
  end

  def parent_choices_with_no_parent_choice
    {'"no parent"' => -1}.merge(parent_choices(@record.id))
  end

  private

  # Check for parent nodes missing from vandt tree and return them if any
  def open_parent_nodes(record)
    add_nodes = nil
    existing_node = nil                     # Init var

    if record.orphaned? || record.archived?
      parents = [{:type => "x", :id => (record.orphaned ? "orph" : "arch")}]
    else
      if x_active_tree == :instances_tree
        parents = record.kind_of?(ManageIQ::Providers::CloudManager::Vm) && record.availability_zone ? [record.availability_zone] : [record.ext_management_system]
      else
        parents = record.parent_blue_folders(:exclude_non_display_folders => true)
      end
    end

    # Go up thru the parents and find the highest level unopened, mark all as opened along the way
    unless parents.empty? || # Skip if no parents or parent already open
           x_tree[:open_nodes].include?(x_build_node_id(parents.last))
      parents.reverse_each do |p|
        p_node = x_build_node_id(p)
        unless x_tree[:open_nodes].include?(p_node)
          x_tree[:open_nodes].push(p_node)
          existing_node = p_node
        end
      end
    end

    # Start at the EMS if record has an EMS and it's not opened yet
    if record.ext_management_system
      ems_node = x_build_node_id(record.ext_management_system)
      unless x_tree[:open_nodes].include?(ems_node)
        x_tree[:open_nodes].push(ems_node)
        existing_node = ems_node
      end
    end

    add_nodes = {:key => existing_node, :nodes => tree_add_child_nodes(existing_node)} if existing_node
    add_nodes
  end

  # if node is VM or Template and hide_vms is true - select parent node in explorer tree but show info of Vm/Template
  def resolve_node_info(id)
    nodetype, id = id.split("-")

    if hide_vms && (nodetype == 'v' || nodetype == 't')
      @vm = VmOrTemplate.find(id)
      self.x_node = parent_folder_id(@vm)
    else
      self.x_node = "#{nodetype}-#{to_cid(id)}"
    end
    get_node_info("#{nodetype}-#{to_cid(id)}")
  end
  public :resolve_node_info

  # Get all info for the node about to be displayed
  def get_node_info(treenodeid, show_list = true)
    # resetting action that was stored during edit to determine what is being edited
    @sb[:action] = nil
    @nodetype, id = if (treenodeid.split('-')[0] == 'v' || treenodeid.split('-')[0] == 't')  && hide_vms
                      @sb[@sb[:active_accord]] = treenodeid
                      parse_nodetype_and_id(treenodeid)
                    else
                      @sb[@sb[:active_accord]] = nil
                      parse_nodetype_and_id(valid_active_node(treenodeid))
                    end
    model, title =  case x_active_tree.to_s
                    when "images_filter_tree"
                      ["ManageIQ::Providers::CloudManager::Template", _("Images")]
                    when "images_tree"
                      ["ManageIQ::Providers::CloudManager::Template", _("Images by Provider")]
                    when "instances_filter_tree"
                      ["ManageIQ::Providers::CloudManager::Vm", _("Instances")]
                    when "instances_tree"
                      ["ManageIQ::Providers::CloudManager::Vm", _("Instances by Provider")]
                    when "vandt_tree"
                      ["VmOrTemplate", _("VMs & Templates")]
                    when "vms_instances_filter_tree"
                      ["Vm", "VMs & Instances"]
                    when "templates_images_filter_tree"
                      ["MiqTemplate", _("Templates & Images")]
                    when "templates_filter_tree"
                      ["ManageIQ::Providers::InfraManager::Template", _("Templates")]
                    when "vms_filter_tree"
                      ["ManageIQ::Providers::InfraManager::Vm", _("VMs")]
                    else
                      [nil, nil]
                    end
    case TreeBuilder.get_model_for_prefix(@nodetype)
    when "Vm", "MiqTemplate"  # VM or Template record, show the record
      show_record(from_cid(id))
      if @record.nil?
        self.x_node = "root"
        get_node_info("root")
        return
      else
        if action_name == "explorer"
          @breadcrumbs.clear
          drop_breadcrumb({:name => breadcrumb_name(model), :url => "/#{controller_name}/explorer"}, false)
        end
        @right_cell_text = _("%{model} \"%{name}\"") % {:name => @record.name, :model => (ui_lookup(:model => model && model != "VmOrTemplate" ? model : TreeBuilder.get_model_for_prefix(@nodetype))).to_s}
      end
    else      # Get list of child VMs of this node
      options = {:model => model}
      if x_node == "root"
        if x_active_tree == :vandt_tree
          klass = ManageIQ::Providers::InfraManager::VmOrTemplate
          options[:where_clause] = ["vms.type IN (?)", klass.vm_descendants.collect(&:name)]
        end
        process_show_list(options) if show_list # Get all VMs & Templates
        # :model=>ui_lookup(:models=>"VmOrTemplate"))
        # TODO: Change ui_lookup/dictionary to handle VmOrTemplate, returning VMs And Templates
        @right_cell_text = if title
                             _("All %{title}") % {:title => title}
                           else
                             _("All VMs & Templates")
                           end
      else
        if TreeBuilder.get_model_for_prefix(@nodetype) == "Hash"
          if x_active_tree == :vandt_tree
            klass = ManageIQ::Providers::InfraManager::VmOrTemplate
            options[:where_clause] = ["vms.type IN (?)", klass.vm_descendants.collect(&:name)]
          end
          if id == "orph"
            options[:where_clause] = MiqExpression.merge_where_clauses(options[:where_clause], VmOrTemplate::ORPHANED_CONDITIONS)
            process_show_list(options) if show_list
            @right_cell_text = if model
                                 _("Orphaned %{models}") % {:models => ui_lookup(:models => model)}
                               else
                                 _("Orphaned VMs & Templates")
                               end
          elsif id == "arch"
            options[:where_clause] = MiqExpression.merge_where_clauses(options[:where_clause], VmOrTemplate::ARCHIVED_CONDITIONS)
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
          rec = TreeBuilder.get_model_for_prefix(@nodetype).constantize.find(from_cid(id))
          options.merge!({:association => (@nodetype == "az" ? "vms" : "all_vms_and_templates"), :parent => rec})
          options[:where_clause] = MiqExpression.merge_where_clauses(
            options[:where_clause], VmOrTemplate::NOT_ARCHIVED_NOR_OPRHANED_CONDITIONS
          )
          process_show_list(options) if show_list
          model_name = @nodetype == "d" ? _("Datacenter") : ui_lookup(:model => rec.class.base_class.to_s)
          @right_cell_text = _("%{object_types} under %{datastore_or_provider} \"%{provider_or_datastore_name}\"") % {
            :object_types               => model ? ui_lookup(:models => model) : _("VMs & Templates"),
            :datastore_or_provider      => model_name,
            :provider_or_datastore_name => rec.name
          }
        end
      end
      # Add adv search filter to header
      @right_cell_text += @edit[:adv_search_applied][:text] if @edit && @edit[:adv_search_applied]

      # save model being displayed for custom buttons
      @tree_selected_model = if model.present?
                               model.constantize
                             end
    end

    if @edit && @edit.fetch_path(:adv_search_applied, :qs_exp) # If qs is active, save it in history
      x_history_add_item(:id     => x_node,
                         :qs_exp => @edit[:adv_search_applied][:qs_exp],
                         :text   => @right_cell_text)
    else
      x_history_add_item(:id => treenodeid, :text => @right_cell_text)  # Add to history pulldown array
    end

    # After adding to history, add name filter suffix if showing a list
    unless ["Vm", "MiqTemplate"].include?(TreeBuilder.get_model_for_prefix(@nodetype))
      unless @search_text.blank?
        @right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text}
      end
    end
    options
  end

  # Replace the right cell of the explorer
  def replace_right_cell(options = {})
    action, presenter = options.values_at(:action, :presenter)

    @explorer = true
    @sb[:action] = action unless action.nil?
    if @sb[:action] || params[:display]
      partial, action, @right_cell_text = set_right_cell_vars # Set partial name, action and cell header
    end

    if !@in_a_form && !@sb[:action]
      id = @record.present? && hide_vms ? TreeBuilder.build_node_cid(@record) : x_node
      id = @sb[@sb[:active_accord]] if @sb[@sb[:active_accord]].present? && params[:action] != 'tree_select'
      get_node_info(id)
      type, _id = parse_nodetype_and_id(id)
      # set @delete_node since we don't rebuild vm tree
      @delete_node = params[:id] if @replace_trees  # get_node_info might set this


      record_showing = type && ["Vm", "MiqTemplate"].include?(TreeBuilder.get_model_for_prefix(type))
      c_tb = build_toolbar(center_toolbar_filename) # Use vm or template tb
      if record_showing
        cb_tb = build_toolbar(Mixins::CustomButtons::Result.new(:single))
        v_tb = build_toolbar("x_summary_view_tb")
      else
        cb_tb = build_toolbar(Mixins::CustomButtons::Result.new(:list))
        v_tb = build_toolbar("x_gtl_view_tb")
      end
    elsif ["compare", "drift"].include?(@sb[:action])
      @in_a_form = true # Turn on Cancel button
      c_tb = build_toolbar("#{@sb[:action]}_center_tb")
      v_tb = build_toolbar("#{@sb[:action]}_view_tb")
    elsif @sb[:action] == "performance"
      c_tb = build_toolbar("x_vm_performance_tb")
    elsif @sb[:action] == "drift_history"
      c_tb = build_toolbar("drifts_center_tb") # Use vm or template tb
    elsif ["snapshot_info", "vmtree_info"].include?(@sb[:action])
      c_tb = build_toolbar("x_vm_center_tb") # Use vm or template tb
    end
    h_tb = build_toolbar("x_history_tb") unless @in_a_form

    unless x_active_tree == :vandt_tree || x_active_tree == :instances_tree
      # Clicked on right cell record, open the tree enough to show the node, if not already showing
      if params[:action] == "x_show" &&
         @record && # Showing a record
         !@in_a_form && # Not in a form
         x_active_tree.to_s !~ /_filter_tree$/ # Not in a filter tree; FIXME: create some property on trees for this
        add_nodes = TreeBuilder.convert_bs_tree(open_parent_nodes(@record)).first # Open the parent nodes of selected record, if not open
      end
    end

    # Build presenter to render the JS command for the tree update
    presenter ||= ExplorerPresenter.new(
      :active_tree => x_active_tree,
      :add_nodes   => add_nodes,         # Update the tree with any new nodes
      :delete_node => @delete_node,      # Remove a new node from the tree
    )

    presenter.show(:default_left_cell).hide(:custom_left_cell)

    add_ajax = false
    if record_showing
      presenter.hide(:form_buttons_div)
      path_dir = @record.kind_of?(ManageIQ::Providers::CloudManager::Vm) || @record.kind_of?(ManageIQ::Providers::CloudManager::Template) ? "vm_cloud" : "vm_common"
      presenter.update(:main_div, r[:partial => "layouts/textual_groups_generic"])
    elsif @in_a_form
      partial_locals = {:controller => 'vm'}
      partial_locals[:action_url] = @lastaction if partial == 'layouts/x_gtl'
      presenter.update(:main_div, r[:partial => partial, :locals => partial_locals])

      locals = {:action_url => action, :record_id => @record.try(:id)}
      if %w(clone migrate miq_request_new pre_prov publish
            reconfigure resize live_migrate attach detach evacuate
            associate_floating_ip disassociate_floating_ip).include?(@sb[:action])
        locals[:no_reset]        = true                              # don't need reset button on the screen
        locals[:submit_button]   = @sb[:action] != 'miq_request_new' # need submit button on the screen
        locals[:continue_button] = @sb[:action] == 'miq_request_new' # need continue button on the screen
        update_buttons(locals) if @edit && @edit[:buttons].present?
        presenter[:clear_tree_cookies] = "prov_trees"
      end

      if ['snapshot_add'].include?(@sb[:action])
        locals[:no_reset]      = true
        locals[:create_button] = true
      end

      if @record.kind_of?(Dialog)
        @record.dialog_fields.each do |field|
          if %w(DialogFieldDateControl DialogFieldDateTimeControl).include?(field.type)
            presenter[:build_calendar] = {
              :date_from => field.show_past_dates ? nil : Time.zone.now,
            }
          end
        end
      end

      if %w(ownership protect reconfigure retire tag).include?(@sb[:action])
        locals[:multi_record] = true    # need save/cancel buttons on edit screen even tho @record.id is not there
        locals[:record_id]    = @sb[:rec_id] || @edit[:object_ids][0] if @sb[:action] == "tag"
        unless %w(ownership retire).include?(@sb[:action])
          presenter[:build_calendar] = {
            :date_from => Time.zone.now,
            :date_to   => nil,
          }
        end
      end

      add_ajax = true

      if ['compare', 'drift'].include?(@sb[:action])
        presenter.update(:custom_left_cell, r[
          :partial => 'layouts/listnav/x_compare_sections', :locals => {:truncate_length => 23}])
        presenter.show(:custom_left_cell).hide(:default_left_cell)
      end
    elsif @sb[:action] || params[:display]
      partial_locals = { :controller => 'vm' }
      if partial == 'layouts/x_gtl'
        partial_locals[:action_url]  = @lastaction
        presenter[:parent_id]    = @record.id           # Set parent rec id for JS function miqGridSort to build URL
        presenter[:parent_class] = params[:controller] # Set parent class for URL also
      end
      presenter.update(:main_div, r[:partial => partial, :locals => partial_locals])

      add_ajax = true
      presenter[:build_calendar] = true
    else
      presenter.update(:main_div, r[:partial => 'layouts/x_gtl'])
    end

    presenter[:ajax_action] = {
      :controller => request.parameters["controller"],
      :action     => @ajax_action,
      :record_id  => @record.id
    } if add_ajax && ['performance', 'timeline'].include?(@sb[:action])

    # Replace the searchbox
    presenter.replace(:adv_searchbox_div, r[
      :partial => 'layouts/x_adv_searchbox',
      :locals  => {:nameonly => ([:images_tree, :instances_tree, :vandt_tree].include?(x_active_tree))}
    ])

    presenter[:clear_gtl_list_grid] = @gtl_type && @gtl_type != 'list'
    presenter[:clear_tree_cookies] = "edit_treeOpenStatex" if @sb[:action] == "policy_sim"

    # Handle bottom cell
    if @pages || @in_a_form
      if @pages && !@in_a_form
        presenter.hide(:form_buttons_div).show(:pc_div_1)
      elsif @in_a_form
        if @sb[:action] == 'dialog_provision'
          presenter.update(:form_buttons_div, r[
            :partial => 'layouts/x_dialog_buttons',
            :locals  => {
              :action_url => action,
              :record_id  => @edit[:rec_id],
            }
          ])
        # these subviews use angular, so they need to use a special partial
        # so the form buttons on the outer frame can be updated.
        elsif %w(attach detach live_migrate resize evacuate ownership
                 associate_floating_ip disassociate_floating_ip).include?(@sb[:action])
          presenter.update(:form_buttons_div, r[:partial => "layouts/angular/paging_div_buttons"])
        elsif action != "retire" && action != "reconfigure_update"
          presenter.update(:form_buttons_div, r[:partial => 'layouts/x_edit_buttons', :locals => locals])
        end

        # Make sure the form_buttons_div is empty.
        # it would remain on the screen if prior to retire some action that uses the form_buttons_div was used
        # such as "edit tags" or "manage policies".
        presenter.update(:form_buttons_div, '') if action == "retire"

        presenter.hide(:pc_div_1).show(:form_buttons_div)
      end
      presenter.show(:paging_div)
    else
      presenter.hide(:paging_div)
    end

    presenter[:right_cell_text] = @right_cell_text

    presenter.reload_toolbars(:history => h_tb, :center => c_tb, :view => v_tb, :custom => cb_tb)

    presenter.set_visibility(h_tb.present? || c_tb.present? || v_tb.present?, :toolbar)

    presenter[:record_id] = @record.try(:id)

    # Hide/show searchbox depending on if a list is showing
    presenter.set_visibility(!(@record || @in_a_form), :adv_searchbox_div)
    presenter[:clear_search_toggle] = clear_search_status

    presenter[:osf_node] = x_node  # Open, select, and focus on this node

    presenter.hide(:blocker_div) unless @edit && @edit[:adv_search_open]
    presenter[:hide_modal] = true
    presenter[:lock_sidebar] = @in_a_form && @edit

    render :json => presenter.for_render
  end

  # get the host that this vm belongs to
  def get_host_for_vm(vm)
    if vm.host
      @hosts = []
      @hosts.push vm.host
    end
  end

  # Set form variables for edit
  def set_form_vars
    @edit = {}
    @edit[:vm_id] = @record.id
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "vm_edit__#{@record.id || "new"}"
    @edit[:explorer] = true if params[:action] == "x_button" || session.fetch_path(:edit, :explorer)

    @edit[:current][:custom_1] = @edit[:new][:custom_1] = @record.custom_1.to_s
    @edit[:current][:description] = @edit[:new][:description] = @record.description.to_s
    if @record.parents.length == 0                                            # Set the currently selected parent
      @edit[:new][:parent] = -1
    else
      @edit[:new][:parent] = @record.parents.first.id
    end

    vms = @record.children                                                      # Get the child VMs
    @edit[:new][:kids] = {}
    vms.each { |vm| @edit[:new][:kids][vm.name + " -- #{vm.location}"] = vm.id }      # Build a hash for the kids list box

    @edit[:choices] = {}
    # items with parents
    ids_with_parents = Relationship.filtered(VmOrTemplate, nil)
                                   .where.not(:ancestry => ['', nil])
                                   .in_relationship('genealogy')
                                   .pluck(:resource_id)

    # Build a hash for the VMs to choose from, only if they have no parent
    @edit[:choices] = parent_choices(ids_with_parents + [@record.id] + vms.pluck(:id))

    @edit[:current][:parent] = @edit[:new][:parent]
    @edit[:current][:kids] = @edit[:new][:kids].dup
    session[:edit] = @edit
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

  # return correct node to right cell
  def x_node_right_cell
    @sb[@sb[:active_accord]].present? ? @sb[@sb[:active_accord]] : x_node
  end

  # set partial name and cell header for edit screens
  def set_right_cell_vars
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
      if @sb[:action] == "compare"
        header = _("Compare %{vm_or_template}") % {:vm_or_template => ui_lookup(:model => @sb[:compare_db])}
      else
        header = _("Drift for %{vm_or_template} \"%{name}\"") %
          {:name => name, :vm_or_template => ui_lookup(:model => @sb[:compare_db])}
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
    when "edit"
      partial = "vm_common/form"
      header = _("Editing %{vm_or_template} \"%{name}\"") %
        {:name => name, :vm_or_template => ui_lookup(:table => table)}
      action = "edit_vm"
    when 'chargeback'
      partial = @refresh_partial
      header = _('Chargeback preview for "%{vm_name}"') % { :vm_name => name }
      action = 'vm_chargeback'
    when "evm_relationship"
      partial = "vm_common/evm_relationship"
      header = _("Edit %{product} Server Relationship for %{vm_or_template} \"%{name}\"") %
        {:vm_or_template => ui_lookup(:table => table), :name => name, :product => I18n.t('product.name')}
      action = "evm_relationship_update"
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
      header = _("Set Ownership for %{vms_or_templates}") % {:vms_or_templates => ui_lookup(:table => table)}
      action = "ownership_update"
    when "performance"
      partial = "layouts/performance"
      header = _("Capacity & Utilization data for %{vm_or_template} \"%{name}\"") %
        {:vm_or_template => ui_lookup(:table => table), :name => name}
      x_history_add_item(:id      => x_node_right_cell,
                         :text    => header,
                         :button  => params[:pressed],
                         :display => params[:display])
      action = nil
    when "policy_sim"
      if params[:action] == "policies"
        partial = "vm_common/policies"
        header = _("%{vm_or_template} Policy Simulation") % {:vm_or_template => ui_lookup(:table => table)}
        action = nil
      else
        partial = "layouts/policy_sim"
        header = _("%{vm_or_template} Policy Simulation") % {:vm_or_template => ui_lookup(:table => table)}
        action = nil
      end
    when "protect"
      partial = "layouts/protect"
      header = _("%{vm_or_template} Policy Assignment") % {:vm_or_template => ui_lookup(:table => table)}
      action = "protect"
    when "reconfigure"
      partial = "vm_common/reconfigure"
      header = _("Reconfigure %{vm_or_template}") % {:vm_or_template => ui_lookup(:table => table)}
      action = "reconfigure_update"
    when "resize"
      partial = "vm_common/resize"
      header = _("Reconfiguring %{vm_or_template} \"%{name}\"") %
        {:vm_or_template => ui_lookup(:table => table), :name => name}
      action = "resize_vm"
    when "retire"
      partial = "shared/views/retire"
      header = _("Set/Remove retirement date for %{vm_or_template}") % {:vm_or_template => ui_lookup(:table => table)}
      action = "retire"
    when "right_size"
      partial = "vm_common/right_size"
      header = _("Right Size Recommendation for %{vm_or_template} \"%{name}\"") %
        {:vm_or_template => ui_lookup(:table => table), :name => name}
      action = nil
    when "tag"
      partial = "layouts/tagging"
      header = _("Edit Tags for %{vm_or_template}") % {:vm_or_template => ui_lookup(:table => table)}
      action = "tagging_edit"
    when "snapshot_add"
      partial = "vm_common/snap"
      header = _("Adding a new %{snapshot}") % {:snapshot => ui_lookup(:model => "Snapshot")}
      action = "snap_vm"
    when "timeline"
      partial = "layouts/tl_show"
      header = _("Timelines for %{virtual_machine} \"%{name}\"") %
        {:virtual_machine => ui_lookup(:table => table), :name => name}
      x_history_add_item(:id     => x_node_right_cell,
                         :text   => header,
                         :button => params[:pressed])
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
        x_history_add_item(:id     => x_node_right_cell,
                           :text   => header,
                           :action => @sb[:action],
                           :item   => @item.id)
      else
        header = _("\"%{action}\" for %{vm_or_template} \"%{name}\"") % {
          :vm_or_template => ui_lookup(:table => table),
          :name           => name,
          :action         => action_type(@sb[:action], 2)
        }
        if @display && @display != "main"
          x_history_add_item(:id      => x_node_right_cell,
                             :text    => header,
                             :display => @display)
        elsif @sb[:action] != "drift_history"
          x_history_add_item(:id     => x_node_right_cell,
                             :text   => header,
                             :action => @sb[:action])
        end
      end
      action = nil
    end
    return partial, action, header
  end

  def get_vm_child_selection
    if params["right.x"] || params[:button] == "right"
      if params[:kids_chosen].nil?
        add_flash(_("No VMs were selected to move right"), :error)
      else
        kids = @edit[:new][:kids].invert
        params[:kids_chosen].each do |kc|
          if @edit[:new][:kids].value?(kc.to_i)
            @edit[:choices][kids[kc.to_i]] = kc.to_i
            @edit[:new][:kids].delete(kids[kc.to_i])
          end
        end
      end
    elsif params["left.x"] || params[:button] == "left"
      if params[:choices_chosen].nil?
        add_flash(_("No VMs were selected to move left"), :error)
      else
        kids = @edit[:choices].invert
        params[:choices_chosen].each do |cc|
          if @edit[:choices].value?(cc.to_i)
            @edit[:new][:kids][kids[cc.to_i]] = cc.to_i
            @edit[:choices].delete(kids[cc.to_i])
          end
        end
      end
    elsif params["allright.x"] || params[:button] == "allright"
      if @edit[:new][:kids].length == 0
        add_flash(_("No child VMs to move right, no action taken"), :error)
      else
        @edit[:new][:kids].each do |key, value|
          @edit[:choices][key] = value
        end
        @edit[:new][:kids].clear
      end
    end
  end

  # Get variables from edit form
  def get_form_vars
    @record = VmOrTemplate.find_by_id(@edit[:vm_id])
    @edit[:new][:custom_1] = params[:custom_1] if params[:custom_1]
    @edit[:new][:description] = params[:description] if params[:description]
    @edit[:new][:parent] = params[:chosen_parent].to_i if params[:chosen_parent]
    # if coming from explorer
    get_vm_child_selection if ["allright", "left", "right"].include?(params[:button])
  end

  # Build the audit object when a record is saved, including all of the changed fields
  def build_saved_vm_audit(vm)
    msg = "[#{vm.name} -- #{vm.location}] Record saved ("
    event = "vm_genealogy_change"
    i = 0
    @edit[:new].each_key do |k|
      if @edit[:new][k] != @edit[:current][k]
        msg += ", " if i > 0
        i += 1
        if k == :kids
          # if @edit[:new][k].is_a?(Hash)
          msg = msg + k.to_s + ":[" + @edit[:current][k].keys.join(",") + "] to [" + @edit[:new][k].keys.join(",") + "]"
        elsif k == :parent
          parent_choices_invert = parent_choices_with_no_parent_choice.invert
          current_parent_choice = parent_choices_invert[@edit[:current][k]]
          new_parent_choice     = parent_choices_invert[@edit[:new][k]]
          msg = "#{msg}#{k}:[#{current_parent_choice}] to [#{new_parent_choice}]"
        else
          msg = msg + k.to_s + ":[" + @edit[:current][k].to_s + "] to [" + @edit[:new][k].to_s + "]"
        end
      end
    end
    msg += ")"
    audit = {:event => event, :target_id => vm.id, :target_class => vm.class.base_class.name, :userid => session[:userid], :message => msg}
  end

  # get the sort column for the detail lists that was clicked on, else use the current one
  def get_detail_sort_col
    if params[:page].nil? && params[:type].nil? && params[:searchtag].nil?    # paging, gtltype change, or search tag did not come in
      if params[:sortby].nil? # no column clicked, reset to first column, ascending
        @detail_sortcol = 0
        @detail_sortdir = "ASC"
      else
        if @detail_sortcol == params[:sortby].to_i                        # if same column was selected
          @detail_sortdir = flip_sort_direction(@detail_sortdir)
        else
          @detail_sortdir = "ASC"
        end
        @detail_sortcol = params[:sortby].to_i
      end
    end

    # in case sort column is not set, set the defaults
    if @detail_sortcol.nil?
      @detail_sortcol = 0
      @detail_sortdir = "ASC"
    end

    @detail_sortcol
  end

  # Gather up the vm records from the DB
  def get_vms(selected = nil)
    page = params[:page].nil? ? 1 : params[:page].to_i
    @current_page = page
    @items_per_page = settings(:perpage, @gtl_type.to_sym) # Get the per page setting for this gtl type
    if selected                             # came in with a list of selected ids (i.e. checked vms)
      @record_pages, @records = paginate(:vms, :per_page => @items_per_page, :order => @col_names[get_sort_col] + " " + @sortdir, :conditions => ["id IN (?)", selected])
    else                                      # getting ALL vms
      @record_pages, @records = paginate(:vms, :per_page => @items_per_page, :order => @col_names[get_sort_col] + " " + @sortdir)
    end
  end

  def update_buttons(locals)
    locals[:continue_button] = locals[:submit_button] = false
    locals[:continue_button] = true if @edit[:buttons].include?(:continue)
    locals[:submit_button] = true if @edit[:buttons].include?(:submit)
  end

  def breadcrumb_prohibited_for_action?
    !%w(accordion_select explorer tree_select).include?(action_name)
  end
end
