module ApplicationController::MiqRequestMethods
  extend ActiveSupport::Concern
  included do
    helper_method :dialog_partial_for_workflow
  end

  # AJAX driven routine to check for changes on the provision form
  def prov_field_changed
    if params[:tab_id]
      @edit = session[:edit]
    else
      return unless load_edit("prov_edit__#{params[:id]}", "show_list")
    end
    if @edit.nil? || @edit.try(:[], :stamp_typ) # load tab for show screen
      if params[:tab_id]
        @options[:current_tab_key] = params[:tab_id].split('_')[0].to_sym
        @options[:wf].refresh_field_values(@options)
      end
      prov_load_tab
    else
      if params[:tab_id]
        @edit[:new][:current_tab_key] = params[:tab_id].split('_')[0].to_sym
        @edit[:wf].refresh_field_values(@edit[:new])
      end
      refresh_divs = prov_get_form_vars # Get changed option, returns true if divs need refreshing
      build_grid if refresh_divs
      changed = (@edit[:new] != @edit[:current])
      @record =
        if @edit[:new][:src_configured_system_ids].present?
          PhysicalServer.where(:id => @edit[:new][:src_configured_system_ids].first).first
        elsif @edit[:new][:src_vm_id].first.present?
          MiqTemplate.where(:id => @edit[:new][:src_vm_id].first).first
        end
      render :update do |page|
        page << javascript_prologue
        # Going thru all dialogs to see if model has set any of the dialog display to hide/ignore
        all_dialogs = @edit[:wf].get_all_dialogs
        all_dialogs.each do |dialog_name, dialog|
          page << "miq_tabs_show_hide('#{dialog_name}_tab', #{dialog[:display] == :show});"
        end
        if refresh_divs
          all_dialogs.each do |dialog_name, dialog|
            if dialog[:display] == :show && dialog_name == @edit[:new][:current_tab_key]
              page.replace_html(dialog_name, :partial => dialog_partial_for_workflow, :locals => {:wf => @edit[:wf], :dialog => dialog_name})
            end
          end
        end
        if @edit.fetch_path(:new, :schedule_type, 0) == "schedule"
          page << "ManageIQ.calendar.calDateFrom = new Date(#{@timezone_offset});"
          page << "miqBuildCalendar();"
        end
        if @edit.fetch_path(:new, :owner_email).blank?
          page << javascript_hide("lookup_button_on")
          page << javascript_show("lookup_button_off")
        else
          page << javascript_hide("lookup_button_off")
          page << javascript_show("lookup_button_on")
        end
        if changed != session[:changed]
          session[:changed] = changed
          page << javascript_for_miq_button_visibility(changed)
        end
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page << "miqSparkle(false);"
      end
    end
  end

  def pre_prov_continue
    if params[:button] == "submit"
      prov_edit
    else
      pre_prov
    end
  end

  # Pre provisioning, select a template
  def pre_prov
    if params[:button] == "cancel"
      flash_to_session(_("Add of new %{type} Request was cancelled by the user") % {:type => session[:edit][:prov_type]})
      @explorer = session[:edit][:explorer] ? session[:edit][:explorer] : false
      @edit = session[:edit] = nil # Clear out session[:edit]
      prov_request_cancel_submit_response
    elsif params[:button] == "continue" # Template chosen, start vm provisioning
      params[:button] = nil # Clear the incoming button
      @edit = session[:edit] # Grab what we need from @edit
      @explorer = @edit[:explorer]

      if @edit[:wf].nil?
        @src_vm_id = @edit[:src_vm_id] # Hang on to selected VM to populate prov
        @edit = session[:edit] = nil
      else
        @workflow_exists = true
        @src_vm_id = @edit[:wf].last_vm_id
        validate_preprov
      end
      if @flash_array
        javascript_flash
      else
        @redirect_controller = "miq_request"
        @refresh_partial = "miq_request/prov_edit"
        if @explorer
          @_params[:org_controller] = "vm" # Set up for prov_edit
          prov_edit
          @sb[:action] = "pre_prov"
          replace_right_cell
        else
          javascript_redirect(:controller     => @redirect_controller,
                              :action         => "prov_edit",
                              :src_vm_id      => @src_vm_id,
                              :org_controller => "vm")
        end
      end
    elsif params[:sort_choice]
      @edit = session[:edit]
      @edit[:vm_sortdir] = if @edit[:vm_sortcol] == params[:sort_choice] # if same column was selected
                             flip_sort_direction(@edit[:vm_sortdir])
                           else
                             'ASC'
                           end
      @edit[:vm_sortcol] = params[:sort_choice]
      render_updated_templates
    elsif params[:sel_id]
      @edit = session[:edit]
      render :update do |page|
        page << javascript_prologue
        page << "$('#row_#{j_str(@edit[:src_vm_id])}').removeClass('selected');" if @edit[:src_vm_id]
        page << "$('#row_#{j_str(params[:sel_id])}').addClass('selected');"
        session[:changed] = true
        page << javascript_for_miq_button_visibility(session[:changed])
        @edit[:src_vm_id] = params[:sel_id].to_i
      end
    elsif params[:hide_deprecated_templates]
      @edit = session[:edit]
      @edit[:hide_deprecated_templates] = params[:hide_deprecated_templates] == "true"
      render_updated_templates
    else # First time in, build pre-provision screen
      set_pre_prov_vars
    end
  end
  alias_method :instance_pre_prov, :pre_prov
  alias_method :vm_pre_prov, :pre_prov

  def render_updated_templates
    report_scopes = [:eligible_for_provisioning]
    report_scopes.push(:non_deprecated) if @edit[:hide_deprecated_templates]
    options = options_for_provisioning(get_template_kls.to_s, report_scopes)

    @report_data_additional_options = ApplicationController::ReportDataAdditionalOptions.from_options(options)
    @report_data_additional_options.with_no_checkboxes(true)
    render :update do |page|
      page << javascript_prologue
      page.replace("pre_prov_div", :partial => "miq_request/pre_prov")
      page << "miqSparkle(false);"
    end
  end

  def set_pre_prov_vars
    @layout = "miq_request_vm"
    @edit = {}
    @edit[:explorer] = @explorer
    @edit[:vm_sortdir] ||= "ASC"
    @edit[:vm_sortcol] ||= "name"
    @edit[:prov_type] = "VM Provision"
    @edit[:hide_deprecated_templates] = true if request.parameters[:controller] == "vm_cloud"

    unless %w[image_miq_request_new miq_template_miq_request_new].include?(params[:pressed])
      path_to_report = ManageIQ::UI::Classic::Engine.root.join("product", "views", provisioning_report).to_s
      @view = MiqReport.new(YAML.safe_load(File.open(path_to_report), [Symbol]))
      @view.db = get_template_kls.to_s
      report_scopes = %i[eligible_for_provisioning non_deprecated]
      options = options_for_provisioning(@view.db, report_scopes)

      @report_data_additional_options = ApplicationController::ReportDataAdditionalOptions.from_options(options)
      @report_data_additional_options.with_no_checkboxes(true)
      @report_data_additional_options.in_a_form(true)

      @edit[:template_kls] = get_template_kls
    end
    session[:changed] = false # Turn off the submit button
    @edit[:explorer] = true if @explorer
  end

  def get_template_kls
    # when clone/migrate buttons are pressed from a sub list view,
    # these buttons are only available on Infra side
    return ManageIQ::Providers::InfraManager::Template if params[:prov_type]
    if request.parameters[:template_klass] == 'cloud' || request.parameters[:controller] == 'vm_cloud'
      return ManageIQ::Providers::CloudManager::Template
    elsif request.parameters[:template_klass] == 'infra' || request.parameters[:controller] == 'vm_infra'
      return ManageIQ::Providers::InfraManager::Template
    else
      return MiqTemplate
    end
  end

  # Add/edit a provision request
  def prov_edit
    if params[:button] == "cancel"
      req = MiqRequest.find(session[:edit][:req_id]) if session[:edit] && session[:edit][:req_id]
      flash_to_session(
        if req && req.id
          _("Edit of %{model} Request \"%{name}\" was cancelled by the user") %
            {:model => session[:edit][:prov_type], :name => req.description}
        else
          _("Provision %{type} Request was cancelled by the user") % {:type => session[:edit][:prov_type]}
        end
      )
      @explorer = session[:edit][:explorer] ? session[:edit][:explorer] : false
      @edit = session[:edit] = nil # Clear out session[:edit]
      @breadcrumbs.pop if @breadcrumbs
      prov_request_cancel_submit_response
    elsif params[:button] == "submit" # Update or create the request from the workflow with the new options
      prov_req_submit
    else # First time in, build provision request screen
      @layout = layout_from_tab_name(params[:org_controller])
      if params[:commit] == "Upload" && session.fetch_path(:edit, :new, :sysprep_enabled, 1) == "Sysprep Answer File"
        upload_sysprep_file
        @tabactive = "customize"
      else
        if params[:req_id]
          prov_set_form_vars(MiqRequest.find(params[:req_id]))    # Set vars from existing request
          session[:changed] = false                               # Turn off the submit button
        else
          prov_set_form_vars                                      # Set default vars
          session[:changed] = true                                # Turn on the submit button
        end
        @edit[:explorer] = true if @explorer
        @tabactive = @edit[:new][:current_tab_key]
      end
      drop_breadcrumb(:name => if params[:req_id]
                                 _("Edit %{type}") % {:type => @edit[:prov_type]}
                               else
                                 _("Add %{type}") % {:type => @edit[:prov_type]}
                               end,
                      :url  => "/vm/provision")
      @in_a_form = true
      #     render :action=>"show"
    end
  end

  # get the sort column that was clicked on, else use the current one
  def sort_ds_grid
    return unless load_edit("prov_edit__#{params[:id]}", "show_list")
    field = %w[miq_template vm service_template].include?(@edit[:org_controller]) ? :placement_ds_name : :attached_ds
    sort_grid('ds', @edit[:wf].get_field(field, :environment)[:values])
  end

  # get the sort column that was clicked on, else use the current one
  def sort_vm_grid
    return unless load_edit("prov_edit__#{params[:id]}", "show_list")
    sort_grid('vm', @edit[:wf].get_field(:src_vm_id, :service)[:values])
  end

  # get the sort column that was clicked on, else use the current one
  def sort_host_grid
    return unless load_edit("prov_edit__#{params[:id]}", "show_list")
    sort_grid('host', @edit[:wf].get_field(:placement_host_name, :environment)[:values])
  end

  # get the sort column that was clicked on, else use the current one
  def sort_configured_system_grid
    return unless load_edit("prov_edit__#{params[:id]}", "show_list")
    sort_grid('configured_system', @edit[:wf].get_field(:src_configured_system_ids, :service)[:values])
  end

  # get the sort column that was clicked on, else use the current one
  def sort_pxe_img_grid
    return unless load_edit("prov_edit__#{params[:id]}", "show_list")
    sort_grid('pxe_img', @edit[:wf].get_field(:pxe_image_id, :service)[:values])
  end

  # get the sort column that was clicked on, else use the current one
  def sort_iso_img_grid
    return unless load_edit("prov_edit__#{params[:id]}", "show_list")
    sort_grid('iso_img', @edit[:wf].get_field(:iso_image_id, :service)[:values])
  end

  def sort_windows_image_grid
    return unless load_edit("prov_edit__#{params[:id]}", "show_list")
    sort_grid('windows_image', @edit[:wf].get_field(:windows_image_id, :service)[:values])
  end

  # get the sort column that was clicked on, else use the current one
  def sort_vc_grid
    @edit = session[:edit]
    sort_grid('vc', @edit[:wf].get_field(:sysprep_custom_spec, :customize)[:values])
  end

  # get the sort column that was clicked on, else use the current one
  def sort_template_grid
    @edit = session[:edit]
    sort_grid('template', @edit[:wf].get_field(:customization_template_id, :customize)[:values])
  end

  private ############################

  def _build_whatever_grid(what, list, headers, sort_order, sort_by, integer_fields = [], state = @edit)
    state["#{what}_headers".to_sym] = headers
    state["#{what}_columns".to_sym] = headers.keys
    state["#{what}_sortcol".to_sym] = sort_by
    state["#{what}_sortdir".to_sym] = sort_order

    post_sort_method = integer_fields.include?(sort_by) ? :to_i : :downcase
    sorted = list.sort_by { |item| item.deep_send(sort_by).to_s.send(post_sort_method) }.uniq
    sort_order == "ASC" ? sorted : sorted.reverse
  end

  def build_configured_system_grid(configured_systems, sort_order = nil, sort_by = nil)
    sort_by ||= "hostname"
    sort_order ||= "ASC"
    headers = if @edit[:wf].kind_of?(PhysicalServerProvisionWorkflow)
                {
                  "name" => _("Server Name")
                }
              else
                {
                  "hostname"                        => _("Hostname"),
                  "configuration_location_name"     => _("Configuration Location"),
                  "configuration_organization_name" => _("Configuration Organization"),
                  "operating_system_flavor_name"    => _("Operating System"),
                  "provider_name"                   => _("Provider"),
                }
              end

    @configured_systems = _build_whatever_grid('configured_system', configured_systems, headers, sort_order, sort_by)
  end

  def build_pxe_img_grid(pxe_imgs, sort_order = nil, sort_by = nil)
    sort_by ||= "name"
    sort_order ||= "ASC"

    headers = {
      "name"        => _("Name"),
      "description" => _("Description"),
    }

    @pxe_imgs = _build_whatever_grid('pxe_img', pxe_imgs, headers, sort_order, sort_by)
  end

  def build_iso_img_grid(iso_imgs, sort_order = nil, sort_by = nil)
    sort_by ||= "name"
    sort_order ||= "ASC"

    headers = {
      "name" => _("Name"),
    }

    @iso_imgs = _build_whatever_grid('iso_img', iso_imgs, headers, sort_order, sort_by)
  end

  def build_windows_image_grid(windows_images, sort_order = nil, sort_by = nil)
    sort_by ||= "name"
    sort_order ||= "ASC"

    headers = {
      "name"        => _("Name"),
      "description" => _("Description"),
    }

    @windows_images = _build_whatever_grid('windows_image', windows_images, headers, sort_order, sort_by)
  end

  def build_ds_grid(datastores, sort_order = nil, sort_by = nil)
    sort_by ||= "free_space"
    sort_order ||= "DESC"

    headers = {
      "name"             => _("Name"),
      "free_space"       => _("Free Space"),
      "total_space"      => _("Total Space"),
      "storage_clusters" => _("Storage Clusters"),
    }

    integer_fields = %w[free_space total_space]

    # :datastores, not :dss
    @datastores = _build_whatever_grid('ds', datastores, headers, sort_order, sort_by, integer_fields)
  end

  def build_vc_grid(vcs, sort_order = nil, sort_by = nil)
    sort_by ||= "name"
    sort_order ||= "DESC"

    headers = {
      :name             => _("Name"),
      :description      => _("Description"),
      :last_update_time => _("Last Updated"),
    }

    integer_fields = %w[last_update_time]

    @vcs = _build_whatever_grid('vc', vcs, headers, sort_order, sort_by, integer_fields)
  end

  def build_template_grid(templates, sort_order = nil, sort_by = nil)
    sort_by ||= "name"
    sort_order ||= "DESC"

    headers = {
      :name             => _("Name"),
      :description      => _("Description"),
      :last_update_time => _("Last Updated"),
    }

    integer_fields = %w[last_update_time]

    @templates = _build_whatever_grid('template', templates, headers, sort_order, sort_by, integer_fields)
  end

  def build_vm_grid(vms, sort_order = nil, sort_by = nil, filter_by = nil)
    sort_by ||= "name"
    sort_order ||= "ASC"
    filter_by ||= ->(_) { true }

    headers = {
      "name"                          => _("Name"),
      "operating_system.product_name" => _("Operating System"),
      "platform"                      => _("Platform"),
      "cpu_total_cores"               => _("CPUs"),
      "mem_cpu"                       => _("Memory"),
      "allocated_disk_storage"        => _("Disk Size"),
      "ext_management_system.name"    => _("Provider"),
      "v_total_snapshots"             => _("Snapshots"),
    }

    headers["deprecated"] = _("Deprecated") if request.parameters[:controller] == "vm_cloud"

    # add tenant column header to cloud workflows only
    headers["cloud_tenant"] = _("Tenant") if vms.any? { |vm| vm.respond_to?(:cloud_tenant) }
    # add snapshot/image column header to cloud workflows only, since they're
    # currently the only ones that support the field.
    headers["image?"] = _("Type") if vms.any? { |vm| vm.respond_to?(:image?) }

    integer_fields = %w[allocated_disk_storage mem_cpu cpu_total_cores v_total_snapshots]

    filtered_vms = vms.select { |x| filter_by.call(x) }
    @vms = _build_whatever_grid('vm', filtered_vms, headers, sort_order, sort_by, integer_fields)
  end

  def build_host_grid(hosts, sort_order = nil, sort_by = nil)
    sort_by ||= "name"
    sort_order ||= "ASC"

    # need to set options from @edit/@option based upon calling screen: show/edit
    options = @edit || @options

    # editable grid for vm/migrate prov screens
    headers = { "name"        => _("Name"),
                "v_total_vms" => _("Total VMs"),
                "vmm_product" => _("Platform"),
                "vmm_version" => _("Version"),
                "state"       => _("State"),
                "maintenance" => _("Maintenance") }

    integer_fields = %w[v_total_vms]

    @hosts = _build_whatever_grid('host', hosts, headers, sort_order, sort_by, integer_fields, options)
  end

  def build_grid
    case @edit[:wf]
    when MiqProvisionConfiguredSystemWorkflow
      build_dialog_page_miq_provision_configured_system_workflow
    when MiqProvisionVirtWorkflow
      if @edit[:new][:current_tab_key] == :service
        if @edit[:new][:st_prov_type]
          build_vm_grid(@edit[:wf].get_field(:src_vm_id, :service)[:values], @edit[:vm_sortdir], @edit[:vm_sortcol], build_template_filter)
        else
          @vm = VmOrTemplate.find(@edit[:new][:src_vm_id] && @edit[:new][:src_vm_id][0])
        end
        if @edit[:wf].supports_pxe?
          build_pxe_img_grid(@edit[:wf].send("allowed_images"), @edit[:pxe_img_sortdir], @edit[:pxe_img_sortcol])
        end
        if @edit[:wf].supports_iso?
          build_iso_img_grid(@edit[:wf].send("allowed_iso_images"), @edit[:iso_img_sortdir], @edit[:iso_img_sortcol])
        end
      elsif @edit[:new][:current_tab_key] == :environment
        build_host_grid(@edit[:wf].get_field(:placement_host_name, :environment)[:values], @edit[:host_sortdir], @edit[:host_sortcol]) if @edit[:wf].get_field(:placement_host_name, :environment).present?
        build_ds_grid(@edit[:wf].get_field(:placement_ds_name, :environment)[:values], @edit[:ds_sortdir], @edit[:ds_sortcol]) if @edit[:wf].get_field(:placement_ds_name, :environment).present?
      elsif @edit[:new][:current_tab_key] == :customize
        @edit[:template_sortdir] ||= "ASC"
        @edit[:template_sortcol] ||= "name"
        if @edit[:wf].supports_customization_template?
          build_template_grid(@edit[:wf].send("allowed_customization_templates"), @edit[:template_sortdir], @edit[:template_sortcol])
        else
          build_vc_grid(@edit[:wf].get_field(:sysprep_custom_spec, :customize)[:values], @edit[:vc_sortdir], @edit[:vc_sortcol])
        end
        @sb[:vm_os] = VmOrTemplate.find(@edit.fetch_path(:new, :src_vm_id, 0)).platform if @edit.fetch_path(:new, :src_vm_id, 0)
      elsif @edit[:new][:current_tab_key] == :purpose
        build_tags_tree(@edit[:wf], @edit[:new][:vm_tags], true)
      end
    when VmMigrateWorkflow
      if @edit[:new][:current_tab_key] == :environment
        build_host_grid(@edit[:wf].get_field(:placement_host_name, :environment)[:values], @edit[:host_sortdir], @edit[:host_sortcol]) if @edit[:wf].get_field(:placement_host_name, :environment).present?
        build_ds_grid(@edit[:wf].get_field(:placement_ds_name, :environment)[:values], @edit[:ds_sortdir], @edit[:ds_sortcol]) if @edit[:wf].get_field(:placement_ds_name, :environment).present?
      end
    else
      if @edit[:new][:current_tab_key] == :service
        build_host_grid(@edit[:wf].get_field(:src_host_ids, :service)[:values], @edit[:host_sortdir], @edit[:host_sortcol])
        build_pxe_img_grid(@edit[:wf].get_field(:pxe_image_id, :service)[:values], @edit[:pxe_img_sortdir], @edit[:pxe_img_sortcol])
        build_iso_img_grid(@edit[:wf].get_field(:iso_image_id, :service)[:values], @edit[:iso_img_sortdir], @edit[:iso_img_sortcol]) if @edit[:wf].supports_iso?
      elsif @edit[:new][:current_tab_key] == :purpose
        build_tags_tree(@edit[:wf], @edit.fetch_path(:new, tag_symbol_for_workflow), true)
      elsif @edit[:new][:current_tab_key] == :environment
        build_ds_grid(@edit[:wf].get_field(:attached_ds, :environment)[:values], @edit[:ds_sortdir], @edit[:ds_sortcol])
      elsif @edit[:new][:current_tab_key] == :customize
        build_template_grid(@edit[:wf].get_field(:customization_template_id, :customize)[:values], @edit[:template_sortdir], @edit[:template_sortcol])
      end
    end
  end

  def build_dialog_page_miq_provision_configured_system_workflow
    case @edit[:new][:current_tab_key]
    when :purpose
      build_tags_tree(@edit[:wf], @edit.fetch_path(:new, tag_symbol_for_workflow), true)
    when :service
      build_configured_system_grid(@edit[:wf].get_field(:src_configured_system_ids, :service)[:values], @edit[:configured_system_sortdir], @edit[:configured_system_sortcol])
    end
  end

  def dialog_partial_for_workflow
    workflow = @edit.try(:[], :wf) && !@edit[:stamp_typ] ? @edit[:wf] : @options[:wf]
    case workflow
    when MiqProvisionVirtWorkflow then "shared/views/prov_dialog"
    when ManageIQ::Providers::Foreman::ConfigurationManager::ProvisionWorkflow then "prov_configured_system_foreman_dialog"
    when VmMigrateWorkflow then "prov_vm_migrate_dialog"
    when PhysicalServerProvisionWorkflow then "prov_physical_server_dialog"
    end
  end

  def layout_from_tab_name(tab_name)
    case tab_name
    when "ae"                then "miq_request_ae"
    when "host"              then "miq_request_host"
    else                          "miq_request_vm" # Includes "vm"
    end
  end

  def sort_grid(what, values)
    sortdir = "#{what}_sortdir".to_sym
    sortcol = "#{what}_sortcol".to_sym
    unless params[:sort_choice].nil?
      @edit[sortdir] = if @edit[sortcol] == params[:sort_choice] # if same column was selected
                         flip_sort_direction(@edit[sortdir])
                       else
                         "ASC"
                       end
      @edit[sortcol] = params[:sort_choice]
    end

    send("build_#{what}_grid", values, @edit[sortdir], @edit[sortcol])
    render :update do |page|
      page << javascript_prologue
      page.replace("prov_#{what}_div", :partial => "miq_request/prov_#{what}_grid", :locals => {:field_id => params[:field_id]})
      page << "miqSparkle(false);"
    end
  end

  def tag_symbol_for_workflow
    (@edit || @options)[:wf].try(:tag_symbol) || :vm_tags
  end

  # This doesn't run validations, it creates flash messages for errors found in MiqRequestWorkflow#validate
  def validate_fields
    @edit[:wf].get_dialog_order.each do |d|
      @edit[:wf].get_all_fields(d, false).each_value do |field|
        if field[:error].present?
          @error_div ||= d.to_s
          add_flash(field[:error], :error)
        end
      end
    end
  end

  def validate_preprov
    @edit[:wf].get_dialog_order.each do |d|
      @edit[:wf].get_all_fields(d, false).each_value do |field|
        @edit[:wf].validate(@edit[:new])
        unless field[:error].nil?
          @error_div ||= d.to_s
          add_flash(field[:error], :error)
        end
      end
    end
  end

  def prov_request_cancel_submit_response
    if @explorer
      @sb[:action] = nil
      replace_right_cell
    elsif @breadcrumbs && (@breadcrumbs.empty? || @breadcrumbs.last[:url] == "/vm/show_list")
      javascript_redirect(:action => "show_list", :controller => "vm")
    else
      javascript_redirect(@breadcrumbs.last[:url])
    end
  end

  def prov_req_submit
    id = session[:edit][:req_id] || "new"
    return unless load_edit("prov_edit__#{id}", "show_list")
    @edit[:new][:schedule_time] = @edit[:new][:schedule_time].in_time_zone("Etc/UTC") if @edit[:new][:schedule_time]

    begin
      request = @edit[:wf].make_request(@edit[:req_id], @edit[:new])
    rescue => bang
      request = false
      add_flash(bang.message, :error)
    end

    if request
      @breadcrumbs.pop if @breadcrumbs
      org_controller = @edit[:org_controller]
      title = case org_controller
              when "vm"           then _("VMs")
              when "miq_template" then _("Templates")
              else                     _("Hosts")
              end

      flash_message = if @edit[:req_id].nil?
                        _("%{typ} Request was Submitted, you will be notified when your %{title} are ready")
                      else
                        _("%{typ} Request was re-submitted, you will be notified when your %{title} are ready")
                      end
      flash_message = flash_message % {:typ => @edit[:prov_type], :title => title}
      @explorer = @edit[:explorer] ? @edit[:explorer] : false
      @sb[:action] = @edit = session[:edit] = nil
      add_flash(flash_message)

      if role_allows?(:feature => "miq_request_show_list", :any => true)
        flash_to_session
        javascript_redirect(:controller => 'miq_request',
                            :action     => 'show_list',
                            :typ        => org_controller)
      else
        prov_request_cancel_submit_response
      end
    else
      validate_fields
      @edit[:new][:current_tab_key] = @error_div.split('_')[0].to_sym if @error_div
      @edit[:wf].refresh_field_values(@edit[:new])
      build_grid
      render :update do |page|
        page << javascript_prologue
        page.replace("prov_wf_div", :partial => "/miq_request/prov_wf") if @error_div
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      end
    end
  end

  # Get variables from provisioning form
  def prov_get_form_vars
    if params[:ids_checked] # User checked/unchecked a tree node
      ids = params[:ids_checked].split(",")
      # for some reason if tree is not expanded clicking on radiobuttons this.getAllChecked() sends up extra blanks
      @edit.store_path(:new, tag_symbol_for_workflow, ids.select(&:present?).collect(&:to_i))
    end
    id = params[:ou_id].gsub(/_-_/, ",") if params[:ou_id]
    @edit[:new][:ldap_ous] = id.match(/(.*)\,(.*)/)[1..2] if id # ou selected in a tree

    @edit[:new][:start_date]    = params[:miq_date_1] if params[:miq_date_1]
    @edit[:new][:start_hour]    = params[:start_hour] if params[:start_hour]
    @edit[:new][:start_min]     = params[:start_min] if params[:start_min]
    @edit[:new][:schedule_time] = Time.zone.parse("#{@edit[:new][:start_date]} #{@edit[:new][:start_hour]}:#{@edit[:new][:start_min]}")

    params.each do |key, _value|
      next unless key.include?("__")
      d, f  = key.split("__") # Parse dialog and field names from the parameter key
      field = @edit[:wf].get_field(f.to_sym, d.to_sym) # Get the field hash
      val   =
        case field[:data_type] # Get the value, convert to integer or boolean if needed
        when :integer
          params[key].to_i
        when :boolean
          params[key].to_s == "true"
        else
          params[key]
        end

      if field[:values] # If a choice was made
        if field[:values].kind_of?(Hash)
          # set an array of selected ids for security groups field
          if f == "security_groups"
            if params[key] == ""
              @edit[:new][f.to_sym] = [nil]
            else
              @edit[:new][f.to_sym] = []
              params[key].split(",").each { |v| @edit[:new][f.to_sym].push(v.to_i) }
            end
          else
            @edit[:new][f.to_sym] = [val, field[:values][val]] # Save [value, description]
          end
        else
          field[:values].each do |v|
            if v.class.name == "MiqHashStruct" && v.evm_object_class == :Storage
              if %w[miq_template service_template vm].include?(@edit[:org_controller])
                if params[key] == "__DS__NONE__" # Added this to deselect datastore in grid
                  @edit[:new][f.to_sym] = [nil, nil] # Save [value, description]
                elsif v.id.to_i == val.to_i
                  @edit[:new][f.to_sym] = [val, v.name] # Save [value, description]
                end
              elsif params[key] == "__DS__NONE__" # Added this to deselect datastore in grid
                @edit[:new][f.to_sym] = [] # Save [value, description]
              elsif v.id.to_i == val.to_i
                if @edit[:new][f.to_sym].include?(val)
                  @edit[:new][f.to_sym].delete_if { |x| x == val }
                else
                  @edit[:new][f.to_sym].push(val) # Save [value, description]
                end
              end
            elsif v.class.name == "MiqHashStruct" && v.evm_object_class == :Host
              if params[key] == "__HOST__NONE__" # Added this to deselect datastore in grid
                @edit[:new][f.to_sym] = [nil, nil] # Save [value, description]
              elsif v.id.to_i == val.to_i
                @edit[:new][f.to_sym] = [val, v.name] # Save [value, description]
              end
            elsif v.class.name == "MiqHashStruct" && v.evm_object_class == :Vm
              if params[key] == "__VM__NONE__" # Added this to deselect datastore in grid
                @edit[:new][f.to_sym] = [nil, nil] # Save [value, description]
              elsif v.id.to_i == val.to_i
                @edit[:new][f.to_sym] = [val, v.name] # Save [value, description]
              end
            elsif v.class.name == "MiqHashStruct" && (v.evm_object_class == :PxeImage || v.evm_object_class == :WindowsImage)
              if params[key] == "__PXE_IMG__NONE__" # Added this to deselect datastore in grid
                @edit[:new][f.to_sym] = [nil, nil] # Save [value, description]
              elsif v.id == val
                @edit[:new][f.to_sym] = [val, v.name] # Save [value, description]
              end
            elsif v.class.name == "MiqHashStruct" && v.evm_object_class == :IsoImage
              if params[key] == "__ISO_IMG__NONE__" # Added this to deselect datastore in grid
                @edit[:new][f.to_sym] = [nil, nil] # Save [value, description]
              elsif v.id == val
                @edit[:new][f.to_sym] = [val, v.name] # Save [value, description]
              end
            elsif v.class.name == "MiqHashStruct" && v.evm_object_class == :CustomizationTemplate
              if params[key] == "__TEMPLATE__NONE__" # Added this to deselect datastore in grid
                @edit[:new][f.to_sym] = [nil, nil] # Save [value, description]
              elsif v.id.to_i == val.to_i
                @edit[:new][f.to_sym] = [val, v.name] # Save [value, description]
              end
            elsif v.kind_of?(VimHash) || (v.class.name == "MiqHashStruct" && v.evm_object_class == :CustomizationSpec)
              if params[key] == "__VC__NONE__" # Added this to deselect custom_spec in grid
                @edit[:new][f.to_sym] = [nil, nil] # Save [value, description]
              elsif v.id.to_i == val.to_i
                @edit[:new][f.to_sym] = [val, v.name] # Save [value, description]
              end
            elsif v[1].to_i == val.to_i
              @edit[:new][f.to_sym] = [val, v[0]] # Save [value, description]
            end
          end
        end
        begin
          @edit[:wf].refresh_field_values(@edit[:new])
        rescue => bang
          add_flash(bang.message, :error)
          @edit[:new][f.to_sym] = val # Save value
          # No need to refresh dialog divs
          return false
        else
          return true
        end
      else
        @edit[:new][f.to_sym] = val # Save value
        # No need to refresh dialog divs
        return false
      end
    end
  end

  def prov_set_show_vars
    @showtype = "main"
    @options = @miq_request.get_options # Get the provision options from the request record
    @options[:org_controller] = "vm"
    if @options[:schedule_time]
      @options[:schedule_time] = format_timezone(@options[:schedule_time], Time.zone, "raw")
      @options[:start_date] = "#{@options[:schedule_time].month}/#{@options[:schedule_time].day}/#{@options[:schedule_time].year}" # Set the start date
      @options[:start_hour] = @options[:schedule_time].hour.to_s
      @options[:start_min] = @options[:schedule_time].min.to_s
    end
    drop_breadcrumb(:name => @miq_request.description.to_s.split(' submitted')[0], :url => "/miq_request/show/#{@miq_request.id}")
    if @miq_request.workflow_class
      options = {}
      begin
        options[:wf] = @miq_request.workflow(@options)
      rescue MiqException::MiqVmError => bang
        @no_wf_msg = _("Cannot create Request Info, error: %{error_message}") % {:error_message => bang.message}
      end
      if options[:wf]
        options[:wf].init_from_dialog(@options) # Create a new provision workflow for this edit session
        # setting active tab to first visible tab
        options[:wf].get_dialog_order.each do |d|
          if options[:wf].get_dialog(d)[:display] == :show
            @options[:current_tab_key] = d
            break
          end
        end
        @options[tag_symbol_for_workflow] ||= [] # Initialize if came back nil from record
        unless ["VmMigrateRequest"].include?(@miq_request.resource_type)
          svm = VmOrTemplate.where(:id => @options[:src_vm_id][0]).first if @options[:src_vm_id] && @options[:src_vm_id][0]
          @sb[:vm_os] = svm.platform if svm
        end
        @options[:wf] = options[:wf]
      end
    elsif @miq_request.resource_type == 'ServiceRetireRequest'
      @view, @pages = nil
      if (service_id = @miq_request.options[:src_ids].first) && (service = Service.find_by(:id => service_id)) && Rbac.filtered_object(service)
        @view, @pages = get_view(Vm, :parent => service, :view_suffix => 'OrchestrationStackRetireRequest')
      end
    elsif %w[PhysicalServerProvisionRequest PhysicalServerFirmwareUpdateRequest].include?(@miq_request.resource_type)
      @selected_ids = @miq_request.options[:src_ids]
      @view, @pages = get_view(PhysicalServer, :view_suffix => 'PhysicalServerProvisionRequest')
    else
      @options = @miq_request.options
      @options[:memory], @options[:mem_typ] = reconfigure_calculations(@options[:vm_memory][0]) if @options[:vm_memory]
      @force_no_grid_xml = true

      @selected_ids = @miq_request.options[:src_ids]
      @view, @pages = get_view(Vm, :view_suffix => "VmReconfigureRequest")
      # FIXME: use selected_ids passed through get_view to replace all of
      # gtl_selected_records after Gaprindashvili
    end
    @user = User.find_by_userid(@miq_request.stamped_by)
  end

  # Set form variables for provision request
  def prov_set_form_vars(req = nil)
    @edit ||= {}
    session[:prov_options]      = @options = nil  # Clearing out options that were set on show screen
    @edit[:req_id]              = req.try(:id)    # Save existing request record id, if passed in
    @edit[:key]                 = "prov_edit__#{@edit[:req_id] || "new"}"
    options                     = req.try(:get_options) || {} # Use existing request options, if passed in
    @edit[:new]                 = options unless @workflow_exists
    # request originated from controller
    @edit[:org_controller]      = params[:org_controller] ? params[:org_controller] : "vm"
    @edit[:wf], pre_prov_values = workflow_instance_from_vars(req)

    if @edit[:wf]
      @edit[:wf].get_dialog_order.each do |d|
        if @edit[:wf].get_dialog(d)[:display] == :show
          @edit[:new][:current_tab_key] = d
          break
        end
      end
      @edit[:buttons] = @edit[:wf].get_buttons
      @edit[:wf].init_from_dialog(@edit[:new]) # Create a new provision workflow for this edit session
      @timezone_offset = get_timezone_offset
      if @edit[:new][:schedule_time]
        @edit[:new][:schedule_time] = format_timezone(@edit[:new][:schedule_time], Time.zone, "raw")
        @edit[:new][:start_date] = "#{@edit[:new][:schedule_time].month}/#{@edit[:new][:schedule_time].day}/#{@edit[:new][:schedule_time].year}" # Set the start date
        if params[:req_id]
          @edit[:new][:start_hour] = @edit[:new][:schedule_time].hour.to_s
          @edit[:new][:start_min] = @edit[:new][:schedule_time].min.to_s
        else
          @edit[:new][:start_hour] = "00"
          @edit[:new][:start_min] = "00"
        end
      end
      @edit[:new][:src_vm_id] = [nil, nil] unless @edit[:new][:src_vm_id]
      # Check that the provisioning template exists
      if @edit[:wf].request_type == 'template' && @edit[:new][:src_vm_id][0].present?
        @edit[:new][:src_vm_id][0] = nil unless MiqTemplate.exists?(@edit[:new][:src_vm_id][0])
      end
      @edit[:new][tag_symbol_for_workflow] ||= [] # Initialize for new record
      @edit[:current] ||= {}
      @edit[:current] = copy_hash(@edit[:new])
      # Give the model a change to modify the dialog based on the default settings
      # common grids
      @edit[:wf].refresh_field_values(@edit[:new])
      if pre_prov_values
        @edit[:new] = @edit[:new].delete_nils
        @edit[:new] = @edit[:new].merge(pre_prov_values.reject { |k| @edit[:new].keys.include?(k) })
      end

      if @edit[:wf].kind_of?(ManageIQ::Providers::Foreman::ConfigurationManager::ProvisionWorkflow) ||
         @edit[:wf].kind_of?(PhysicalServerProvisionWorkflow)
        # BD TODO
      else
        @edit[:ds_sortdir] ||= "DESC"
        @edit[:ds_sortcol] ||= "free_space"
        @edit[:host_sortdir] ||= "ASC"
        @edit[:host_sortcol] ||= "name"
        build_host_grid(@edit[:wf].send("allowed_hosts"), @edit[:host_sortdir], @edit[:host_sortcol])
        build_ds_grid(@edit[:wf].send("allowed_storages"), @edit[:ds_sortdir], @edit[:ds_sortcol])
        if @edit[:wf].kind_of?(MiqProvisionWorkflow)
          @edit[:vm_sortdir] ||= "ASC"
          @edit[:vm_sortcol] ||= "name"
          @edit[:vc_sortdir] ||= "ASC"
          @edit[:vc_sortcol] ||= "name"
          @edit[:template_sortdir] ||= "ASC"
          @edit[:template_sortcol] ||= "name"
          build_vm_grid(@edit[:wf].send("allowed_templates"), @edit[:vm_sortdir], @edit[:vm_sortcol], build_template_filter)
          if @edit[:wf].supports_pxe?
            build_pxe_img_grid(@edit[:wf].send("allowed_images"), @edit[:pxe_img_sortdir], @edit[:pxe_img_sortcol])
            build_host_grid(@edit[:wf].send("allowed_hosts"), @edit[:host_sortdir], @edit[:host_sortcol])
            build_template_grid(@edit[:wf].send("allowed_customization_templates"), @edit[:template_sortdir], @edit[:template_sortcol])
          elsif @edit[:wf].supports_iso?
            build_iso_img_grid(@edit[:wf].send("allowed_iso_images"), @edit[:iso_img_sortdir], @edit[:iso_img_sortcol])
          else
            build_vc_grid(@edit[:wf].send("allowed_customization_specs"), @edit[:vc_sortdir], @edit[:vc_sortcol])
          end
        elsif @edit[:wf].kind_of?(VmMigrateWorkflow)
        else
          @edit[:template_sortdir] ||= "ASC"
          @edit[:template_sortcol] ||= "name"
          build_pxe_img_grid(@edit[:wf].send("allowed_images"), @edit[:pxe_img_sortdir], @edit[:pxe_img_sortcol])
          build_iso_img_grid(@edit[:wf].send("allowed_iso_images"), @edit[:iso_img_sortdir], @edit[:iso_img_sortcol])
          build_host_grid(@edit[:wf].send("allowed_hosts"), @edit[:host_sortdir], @edit[:host_sortcol])
          build_template_grid(@edit[:wf].send("allowed_customization_templates"), @edit[:template_sortdir], @edit[:template_sortcol])
        end
      end
    else
      @edit[:current] ||= {}
      @edit[:current] = copy_hash(@edit[:new])
    end
  end

  def workflow_instance_from_vars(req)
    options         = {}
    pre_prov_values = nil
    if %w[miq_template service_template vm].include?(@edit[:org_controller])
      if params[:prov_type] && !req # only do this new requests
        @edit[:prov_id] = params[:prov_id]
        wf_type =
          if params[:prov_type] == "migrate"
            @edit[:prov_type]     = "VM Migrate"
            @edit[:new][:src_ids] = params[:prov_id]
            VmMigrateWorkflow
          else
            @edit[:prov_type] = "VM Provision"
            if @edit[:org_controller] == "service_template"
              options[:service_template_request] = true
              ManageIQ::Providers::Vmware::InfraManager::ProvisionWorkflow
            else
              options[:src_vm_id]    = @edit[:prov_id]
              options[:request_type] = params[:prov_type].to_sym
              MiqProvisionWorkflow.class_for_source(options[:src_vm_id])
            end
          end
      else
        options[:initial_pass]             = true  unless req
        options[:service_template_request] = true  if @edit[:org_controller] == "service_template"
        options[:use_pre_dialog]           = false if @workflow_exists
        # setting class to ManageIQ::Providers::Vmware::InfraManager::ProvisionWorkflow for requests where src_vm_id is
        # not already set, i.e catalogitem
        src_vm_id =
          if @edit.fetch_path(:new, :src_vm_id, 0).present?
            @edit[:new][:src_vm_id]
          elsif @src_vm_id || params[:src_vm_id] # Set vm id if pre-prov chose one
            options[:src_vm_id] = [@src_vm_id || params[:src_vm_id].to_i]
          end
        src_vm = VmOrTemplate.where(:id => src_vm_id).first

        wf_type =
          if req.try(:type) == "VmMigrateRequest"
            VmMigrateWorkflow
          elsif src_vm
            MiqProvisionWorkflow.class_for_source(src_vm)
          elsif @edit[:st_prov_type]
            MiqProvisionWorkflow.class_for_platform(@edit[:st_prov_type])
          elsif @edit[:new][:st_prov_type]
            MiqProvisionWorkflow.class_for_platform(@edit[:new][:st_prov_type])
          end
        pre_prov_values = copy_hash(@edit[:wf].values) if @edit[:wf]

        @edit[:prov_type]   = req.try(:request_type) && req.request_type_display
        @edit[:prov_type] ||= req.try(:type) == "VmMigrateRequest" ? "VM Migrate" : "VM Provision"
      end
    elsif @edit[:org_controller] == "configured_system"
      @edit[:prov_type] = "ConfiguredSystem"
      @edit[:new][:src_configured_system_ids] = params[:prov_id].kind_of?(Array) ? params[:prov_id] : [params[:prov_id]]
      wf_type = ManageIQ::Providers::Foreman::ConfigurationManager::ProvisionWorkflow
    elsif @edit[:org_controller] == "physical_server"
      @edit[:prov_type] = "PhysicalServer"
      @edit[:new][:src_configured_system_ids] = params[:prov_id].kind_of?(Array) ? params[:prov_id] : [params[:prov_id]]
      wf_type = PhysicalServerProvisionWorkflow
    end

    [wf_type.new(@edit[:new], current_user, options), pre_prov_values] # Return the new workflow and any pre_prov_values
  rescue => bang
    # only add this message if showing a list of Catalog items, show screen already handles this
    @no_wf_msg = _("Cannot create Request Info, error: %{error_message}") % {:error_message => bang.message}
    _log.log_backtrace(bang)
    nil
  end

  def build_tags_tree(wf, vm_tags, edit_mode)
    tags = wf.send("allowed_tags")
    @curr_tag = nil
    # Build the default filters tree for the search views
    all_tags = [] # Array to hold all CIs
    kids_checked = false
    tags.each_with_index do |t, i| # Go thru all of the Searches
      if @curr_tag.blank? || @curr_tag != t[:name]
        if @curr_tag != t[:name] && @ci_node
          @ci_node[:expand] = true if kids_checked
          kids_checked = false
          @ci_node[:children] = @ci_kids if @ci_kids.present?
          all_tags.push(@ci_node) if @ci_kids.present?
        end
        @curr_tag = t[:name]
        @ci_node = {} # Build the ci node
        @ci_node[:key] = t[:id].to_s
        @ci_node[:title] = t[:description]
        @ci_node[:title] += " *" if t[:single_value]
        @ci_node[:tooltip] = t[:description]
        @ci_node[:addClass] = "cfme-no-cursor-node" # No cursor pointer
        @ci_node[:icon] = 'pficon pficon-folder-close'
        @ci_node[:hideCheckbox] = @ci_node[:cfmeNoClick] = true
        @ci_node[:addClass] = "cfme-bold-node" # Show node as different
        @ci_kids = []
      end
      if @curr_tag.present? && @curr_tag == t[:name]
        t[:children].each do |c|
          temp = {}
          temp[:key] = c[0].to_s
          # only add cfme_parent_key for single value tags, need to use in JS onclick handler
          temp[:selectable] = false
          temp[:title] = temp[:tooltip] = c[1][:description]
          temp[:addClass] = "cfme-no-cursor-node"
          temp[:icon] = 'fa fa-tag'
          if edit_mode # Don't show checkboxes/radio buttons in non-edit mode
            if vm_tags && vm_tags.include?(c[0].to_i)
              temp[:select] = true
              kids_checked = true
            else
              temp[:select] = false
            end
            if @edit && @edit[:current][tag_symbol_for_workflow] != @edit[:new][tag_symbol_for_workflow]
              # checking to see if id is in current but not in new, change them to blue OR if id is in current but deleted from new
              if (!@edit[:current][tag_symbol_for_workflow].include?(c[0].to_i) && @edit[:new][tag_symbol_for_workflow].include?(c[0].to_i)) ||
                 (!@edit[:new][tag_symbol_for_workflow].include?(c[0].to_i) && @edit[:current][tag_symbol_for_workflow].include?(c[0].to_i))
                temp[:addClass] = "cfme-blue-bold-node"
              end
            end
            @ci_kids.push(temp) unless @ci_kids.include?(temp)
          else
            temp[:hideCheckbox] = true
            @ci_kids.push(temp) unless @ci_kids.include?(temp) || !vm_tags.include?(c[0].to_i)
          end
        end
      end
      if i == tags.length - 1 # Adding last node
        @ci_node[:expand] = true if kids_checked
        kids_checked = false
        @ci_node[:children] = @ci_kids if @ci_kids.present?
        all_tags.push(@ci_node) if @ci_kids.present?
      end
    end
    @all_tags_tree = TreeBuilder.convert_bs_tree(all_tags).to_json # Add ci node array to root of tree
  end

  def build_template_filter
    return ->(x) { !x.deprecated } if @edit[:hide_deprecated_templates]

    ->(_) { true } # do not apply a filter
  end

  def options_for_provisioning(db, report_scopes)
    {
      :model         => db,
      :gtl_type      => "table",
      :named_scope   => report_scopes,
      :report_name   => provisioning_report,
      :custom_action => {
        :url  => "/miq_request/pre_prov/?sel_id=",
        :type => 'provisioning'
      }
    }
  end

  def provisioning_report
    if request.parameters[:template_klass] == 'cloud' ||
       %w[auth_key_pair_cloud availability_zone cloud_tenant ems_cloud host_aggregate orchestration_stack vm_cloud].include?(request.parameters[:controller])
      'ProvisionCloudTemplates.yaml'
    elsif request.parameters[:template_klass] == 'infra' ||
          %w[ems_cluster ems_infra host resource_pool storage vm_infra].include?(request.parameters[:controller])
      'ProvisionInfraTemplates.yaml'
    end
  end
end
