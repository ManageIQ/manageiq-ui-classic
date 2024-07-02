class CatalogController < ApplicationController
  include AutomateTreeHelper
  include Mixins::ServiceDialogCreationMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::AutomationMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data
  helper ProvisionCustomizeHelper
  helper MiqAeClassHelper # need the playbook_label

  def self.model
    @model ||= ServiceTemplate
  end

  def self.table_name
    @table_name ||= "service_template"
  end

  def index
    flash_to_session
    redirect_to(:action => 'explorer')
  end

  CATALOG_X_BUTTON_ALLOWED_ACTIONS = {
    'ab_button_new'                 => :ab_button_new,
    'ab_button_edit'                => :ab_button_edit,
    'ab_group_edit'                 => :ab_group_edit,
    'ab_group_new'                  => :ab_group_new,
    'ab_group_reorder'              => :ab_group_reorder,
    'svc_catalog_provision'         => :svc_catalog_provision,
    'st_catalog_delete'             => :st_catalog_delete,

    'atomic_catalogitem_edit'       => :servicetemplate_edit,
    'atomic_catalogitem_new'        => :servicetemplate_edit,
    'catalogitem_edit'              => :servicetemplate_edit,
    'catalogitem_copy'              => :servicetemplate_copy,
    'catalogitem_new'               => :servicetemplate_edit,

    'catalogitem_tag'               => :st_tags_edit,
    'catalogitem_ownership'         => :servicetemplate_ownership,

    'orchestration_template_add'    => :ot_add,
    'orchestration_template_edit'   => :ot_edit,
    'orchestration_template_copy'   => :ot_copy,
    'orchestration_template_remove' => :ot_remove_submit,
    'orchestration_template_tag'    => :ot_tags_edit,
    'service_dialog_from_ot'        => :service_dialog_from_ot,
    'st_catalog_edit'               => :st_catalog_edit,
    'st_catalog_new'                => :st_catalog_edit,
  }.freeze

  ORCHESTRATION_TEMPLATES_NODES = {
    'ManageIQ::Providers::Amazon::CloudManager::OrchestrationTemplate'     => "otcfn",
    'ManageIQ::Providers::Openstack::CloudManager::OrchestrationTemplate'  => "othot",
    'ManageIQ::Providers::Azure::CloudManager::OrchestrationTemplate'      => "otazu",
    'ManageIQ::Providers::AzureStack::CloudManager::OrchestrationTemplate' => "otazs",
    'ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate'           => "otvnf",
    'ManageIQ::Providers::Vmware::CloudManager::OrchestrationTemplate'     => "otvap",
    'ManageIQ::Providers::Vmware::InfraManager::OrchestrationTemplate'     => "otovf"
  }.freeze

  # when methods are evaluated from this constant and return true that means: column is displayed
  DISPLAY_GTL_METHODS = [
    :user_super_admin?
  ].freeze

  def user_super_admin?
    current_user.super_admin_user?
  end

  def x_button
    # setting this here so it can be used in the common code
    @sb[:applies_to_class] = 'ServiceTemplate'
    generic_x_button(CATALOG_X_BUTTON_ALLOWED_ACTIONS)
  end

  EDIT_CATALOG_FEATURES = %w[
    atomic_catalogitem_edit
    catalogitem_edit
    atomic_catalogitem_new
    catalogitem_new
  ].freeze

  def assert_privileges_for_servicetemplate_edit
    if params[:pressed].present? && EDIT_CATALOG_FEATURES.include?(params[:pressed])
      assert_privileges(params[:pressed])
    elsif params[:button].blank?
      assert_privileges('atomic_catalogitem_edit')
    end
  end

  def servicetemplate_edit
    assert_privileges_for_servicetemplate_edit

    checked_id = find_checked_items.first || params[:id]
    @sb[:cached_waypoint_ids] = MiqAeClass.waypoint_ids_for_state_machines
    @record = checked_id.present? ? find_record_with_rbac(ServiceTemplate, checked_id) : ServiceTemplate.new
    @sb[:st_form_active_tab] = "basic"
    composite_type = @record.service_type == "composite"
    new_atomic_item = params[:pressed] == "atomic_catalogitem_new" || (params[:button].present? && session[:edit][:new][:service_type] == "atomic")
    if checked_id.present? && composite_type || checked_id.nil? && !new_atomic_item
      st_edit
    else
      atomic_st_edit
    end
  end

  def ot_orchestration_managers
    assert_privileges("orchestration_templates_view")

    render :json => available_orchestration_managers_for_template_type(params['template_type'])
  end

  def servicetemplate_copy
    assert_privileges("catalogitem_edit")

    checked_id = find_checked_items.first || params[:id]
    @record = find_record_with_rbac(ServiceTemplate, checked_id)
    if !@record.template_valid?
      add_flash(_("This item is not valid and cannot be copied."), :error)
      javascript_flash
    elsif @record.type == 'ServiceTemplateAnsiblePlaybook'
      add_flash(_("ServiceTemplateAnsiblePlaybook cannot be copied."), :error)
      javascript_flash
    else
      @tabactive = false
      @in_a_form = true
      @edit = {}
      session[:changed] = false
      replace_right_cell(:action => "copy_catalog")
    end
  end

  def save_copy_catalog
    assert_privileges("catalogitem_edit")

    record = find_record_with_rbac(ServiceTemplate, params[:id])
    message = nil
    if record.present?
      saved = record.template_copy(params[:name], :copy_tags => params[:copy_tags])
    else
      saved = false
      message = _("Record not found.")
    end
    render :json => {:message => message}, :status => saved ? 200 : 400
  end

  def servicetemplate_copy_cancel
    assert_privileges("catalogitem_new")

    add_flash(_("Copy of a Service Catalog Item was cancelled by the user"), :warning)
    @sb[:action] = @edit = @record = nil
    @in_a_form = false
    replace_right_cell(:replace_trees => trees_to_replace([:sandt]))
  end

  def servicetemplate_copy_saved
    assert_privileges("catalogitem_new")

    add_flash(_("Copy of a Service Catalog Item was successfully saved"))
    @sb[:action] = @edit = @record = nil
    @in_a_form = false
    replace_right_cell(:replace_trees => trees_to_replace(%i[sandt svccat stcat]))
  end

  def servicetemplates_names
    assert_privileges("catalog_items_view")

    render :json => {:names => Rbac.filtered(ServiceTemplate).pluck(:name)}
  end

  def atomic_st_edit
    assert_privileges(params[:id] ? 'atomic_catalogitem_edit' : 'atomic_catalogitem_new')

    # reset the active tree back to :sandt_tree, it was changed temporairly to display automate entry point tree in a popup div
    self.x_active_tree = 'sandt_tree'
    case params[:button]
    when "cancel"
      if session[:edit][:rec_id]
        add_flash(_("Edit of Service Catalog Item \"%{name}\" was cancelled by the user") %
          {:name => session[:edit][:new][:description]})
      else
        add_flash(_("Add of new Service Catalog Item was cancelled by the user"))
      end
      @sb[:action] = @edit = @record = nil
      @in_a_form = false
      replace_right_cell
    when "save", "add"
      assert_privileges("atomic_catalogitem_#{params[:button] == "save" ? "edit" : "new"}")
      atomic_req_submit
    when "reset", nil # Reset or first time in
      @_params[:org_controller] = "service_template"
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      if !@record.id.nil? && need_prov_dialogs?(@record.prov_type)
        request = MiqRequest.find_by(:id => @record.service_resources[0].resource_id) if @record.service_resources[0]&.resource_id
        if request
          prov_set_form_vars(request) # Set vars from existing request
        else
          add_flash(_("Can not edit selected item, Request is missing"), :error)
          @edit = @record = nil
          replace_right_cell
          return
        end
      else
        # prov_set_form_vars
        @edit ||= {} # Set default vars
        @edit[:new] ||= {}
        @edit[:current] ||= {}
        @edit[:key] = "prov_edit__new"
      end
      @edit[:new][:st_prov_type] = @record.prov_type if @record.prov_type.present?
      # set name and description for ServiceTemplate record
      set_form_vars
      @edit[:new][:service_type] = "atomic"
      @edit[:rec_id] = @record.try(:id)
      @edit[:current] = copy_hash(@edit[:new])

      @tabactive = @edit[:new][:current_tab_key]
      @in_a_form = true
      session[:changed] = false
      replace_right_cell(:action => "at_st_new")
    end
  end

  def atomic_form_field_changed
    assert_privileges(session&.fetch_path(:edit, :rec_id) ? "atomic_catalogitem_edit" : "atomic_catalogitem_new")

    # need to check req_id in session since we are using common code for prov requests and atomic ST screens
    id = session[:edit][:req_id] || "new"
    return unless load_edit("prov_edit__#{id}", "replace_cell__explorer")
    get_form_vars
    build_automate_tree(:automate_catalog) if automate_tree_needed?
    if params[:st_prov_type] # build request screen for selected item type
      @_params[:org_controller] = "service_template"
      if ansible_playbook_type? || terraform_template_type?
        @record = ServiceTemplate.new
        # waiting for back-end PR to be merged to implement this
        # if false
        #   add_flash(_("Before adding Ansible Service, at least 1 repository, 1 playbook, 1 credential must exist in VMDB"), :error)
        #   javascript_flash
        #   return
        # end
      else
        prov_set_form_vars if need_prov_dialogs?(params[:st_prov_type])
        @record = class_service_template(params[:st_prov_type]).new
        set_form_vars
        @edit[:new][:st_prov_type] = params[:st_prov_type] if params[:st_prov_type]
        @edit[:new][:service_type] = "atomic"
        default_entry_point(@edit[:new][:st_prov_type],
                            @edit[:new][:service_type])
        @edit[:rec_id] = @record.try(:id)
        @tabactive = @edit[:new][:current_tab_key]
      end
      @edit[:current] = copy_hash(@edit[:new])
    end

    changed = (@edit[:new] != @edit[:current])

    if changed && @edit[:new][:ovf_template_id]
      ovf_template = ManageIQ::Providers::Vmware::InfraManager::OrchestrationTemplate.find_by(:id => @edit[:new][:ovf_template_id])
      @edit[:new][:src_vm_id] = @edit[:new][:ovf_template_id]
      ovf_template.refresh_field_values(@edit[:new])

      @edit[:available_folders] = ovf_template.allowed_folders
                                              .collect { |m| [m.last, m.first] }
                                              .sort
      @edit[:available_resource_pools] = ovf_template.allowed_resource_pools
                                                     .collect { |m| [m.last, m.first] }
                                                     .sort
      @edit[:available_datacenters] = ovf_template.allowed_datacenters
                                                  .collect { |m| [m.last, m.first] }
                                                  .sort
      @edit[:available_hosts] = ovf_template.allowed_hosts
                                            .collect { |h| [h.name, h.id] }
                                            .sort
      @edit[:available_storages] = ovf_template.allowed_storages
                                               .collect { |s| [s.name, s.id] }
                                               .sort
    end

    render :update do |page|
      page << javascript_prologue
      if @edit[:new][:st_prov_type] == "generic_terraform_template"
        page.replace("form_div", :partial => "tt_react_form")
        page << javascript_hide("form_buttons_div")
      elsif @edit[:new][:st_prov_type] == "generic_ansible_playbook"
        page.replace("form_div", :partial => "st_angular_form")
        page << javascript_hide("form_buttons_div")
      else
        # for generic/orchestration type tabs do not show up on screen
        # as there is only a single tab when form is initialized
        # when display in catalog is checked, replace div so tabs can be redrawn
        if (params[:st_prov_type] || (params[:display] && @edit[:new][:st_prov_type].starts_with?("generic"))) || params[:ovf_template_id]
          page.replace("form_div", :partial => "st_form")
        end
        if automate_tree_needed?
          page.replace("basic_info_div", :partial => "form_basic_info")
        end
        if params[:display]
          page << "miq_tabs_show_hide('#details_tab', '#{(params[:display] == "1")}')"
        end
        page.replace_html("provision_entry_point", :partial => "provision_entry_point") if params[:provision_entry_point_type]
        page.replace_html("reconfigure_entry_point", :partial => "reconfigure_entry_point") if params[:reconfigure_entry_point_type]
        page.replace_html("retire_entry_point", :partial => "retire_entry_point") if params[:retire_entry_point_type]

        %w[fqname reconfigure_fqname retire_fqname].each do |name|
          if params[name.to_sym] && @edit[:new][name.to_sym].present?
            page << "$('##{name}_remove').attr('disabled', false);"
          end
        end
        if changed != session[:changed]
          page << javascript_for_miq_button_visibility(changed)
          session[:changed] = changed
        end
        page.replace_html("price_span", @edit[:new][:code_currency])
        page << set_spinner_off
      end
    end
  end

  # VM or Template show selected, redirect to proper controller
  def show
    assert_privileges("catalog_items_view")

    @sb[:action] = nil
    @explorer = true if request.xml_http_request? # Ajax request means in explorer
    record = ServiceTemplate.find(params[:id])
    if !@explorer
      tree_node_id = TreeBuilder.build_node_id(record)
      redirect_to(:controller => "catalog",
                  :action     => "explorer",
                  :id         => tree_node_id)
      return
    else
      redirect_to(:action => 'show', :controller => record.class.base_model.to_s.underscore, :id => record.id)
    end
  end

  def explorer
    @explorer = true
    @lastaction = "explorer"
    @report_deleted = params[:report_deleted] == 'true' if params[:report_deleted]
    @sb[:action] = nil

    # if AJAX request, replace right cell, and return
    if request.xml_http_request?
      replace_right_cell
      return
    end

    if params[:id] && !params[:button] # If a tree node id came in, show in one of the trees
      @nodetype, id = parse_nodetype_and_id(params[:id])
      self.x_active_tree   = 'sandt_tree'
      self.x_active_accord = 'sandt'
      st = ServiceTemplate.find(params[:id].split("-").last)
      prefix = st.service_template_catalog_id ? "stc-#{st.service_template_catalog_id}_st-" : "-Unassigned_st-"
      self.x_node = "#{prefix}#{id}"
      get_node_info(x_node)
    else
      @in_a_form = false
    end

    build_accordions_and_trees

    if params[:commit] == "Upload" && session.fetch_path(:edit, :new, :sysprep_enabled, 1) == "Sysprep Answer File"
      upload_sysprep_file
      set_form_locals_for_sysprep
    end
    template_locals = {:locals => {:controller => "catalog"}}
    template_locals[:locals].merge!(fetch_playbook_details) if need_ansible_locals?
    template_locals[:locals].merge!(fetch_terraform_template_details) if need_terraform_locals?
    template_locals[:locals].merge!(fetch_ct_details) if need_container_template_locals?
    template_locals[:locals].merge!(fetch_ovf_template_details) if need_ovf_template_locals?

    render :layout => "application", :action => "explorer", :locals => template_locals
  end

  def set_form_locals_for_sysprep
    @pages = false
    @edit[:explorer] = true
    @sb[:st_form_active_tab] = "request"
    @right_cell_text = _("Adding a new Service Catalog Item")
    @x_edit_buttons_locals = {:action_url => "servicetemplate_edit"}
  end

  def identify_catalog(id = nil)
    kls = TreeBuilder.get_model_for_prefix(@nodetype) == "MiqTemplate" ? VmOrTemplate : ServiceTemplate
    @record = identify_record(id || params[:id], kls)
    @tenants_tree = build_tenants_tree if kls == ServiceTemplate # Build the tree with available tenants for the Catalog Item/Bundle
    add_flash(_("This item is invalid"), :warning) unless @flash_array || @record.try(:template_valid?)
  end

  # ST clicked on in the explorer right cell
  def x_show
    @sb[:action] = nil
    @explorer = true
    if x_active_tree == :stcat_tree
      assert_privileges("st_catalog_view")

      if params[:rec_id]
        # link to Catalog Item clicked on catalog summary screen
        self.x_active_tree = :sandt_tree
        self.x_active_accord = 'sandt'
        @record = ServiceTemplate.find(params[:rec_id])
      else
        @record = ServiceTemplateCatalog.find(params[:id])
      end
    elsif x_active_tree == :sandt_tree
      assert_privileges("catalog_items_view")

      identify_catalog(params[:id])
      @record ||= ServiceTemplateCatalog.find(params[:id])
    elsif x_active_tree == :ot_tree
      assert_privileges("orchestration_templates_view")

      @record ||= OrchestrationTemplate.find(params[:id])
    else
      assert_privileges("svc_catalog_provision", "svc_catalog_archive", "svc_catalog_unarchive")

      identify_catalog(params[:id])
      @record ||= ServiceTemplateCatalog.find(params[:id])
    end
    params[:id] = x_build_node_id(@record) # Get the tree node id
    tree_select
  end

  def st_edit
    assert_privileges(params[:id] ? 'catalogitem_edit' : 'catalogitem_new')

    # reset the active tree back to :sandt_tree, it was changed temporairly to display automate entry point tree in a popup div
    self.x_active_tree = 'sandt_tree'
    case params[:button]
    when "cancel"
      if session[:edit][:rec_id]
        add_flash(_("Edit of Catalog Bundle \"%{name}\" was cancelled by the user") %
                    {:name => session[:edit][:new][:description]})
      else
        add_flash(_("Add of new Catalog Bundle was cancelled by the user"))
      end
      @sb[:action] = @edit = @record = nil
      @in_a_form = false
      replace_right_cell
    when "save", "add"
      return unless load_edit("st_edit__#{params[:id] || "new"}", "replace_cell__explorer")

      get_form_vars
      if @edit[:new][:name].blank?
        add_flash(_("Name is required"), :error)
      end

      if @edit[:new][:selected_resources].empty?
        add_flash(_("Resource must be selected"), :error)
      end
      add_flash(_("Provisioning Entry Point is required"), :error) if @edit[:new][:fqname].blank?
      validate_price
      dialog_catalog_check

      if @flash_array
        javascript_flash
        return
      end
      @st = @edit[:rec_id] ? ServiceTemplate.find(@edit[:rec_id]) : ServiceTemplate.new
      st_set_record_vars(@st)
      if @add_rsc
        if @st.save
          set_resource_action(@st)
          flash_key = if params[:button] == "save"
                        _("Catalog Bundle \"%{name}\" was saved")
                      else
                        _("Catalog Bundle \"%{name}\" was added")
                      end
          add_flash(flash_key % {:name => @edit[:new][:name]})
          @changed = session[:changed] = false
          @in_a_form = false
          @edit = session[:edit] = @record = nil
          replace_right_cell(:replace_trees => trees_to_replace(%i[sandt svccat stcat]))
        else
          @st.errors.each do |error|
            add_flash("#{error.attribute.to_s.capitalize} #{error.message}", :error)
          end
          @changed = session[:changed] = (@edit[:new] != @edit[:current])
          javascript_flash
        end
      else
        javascript_flash
        return
      end
    when "reset", nil # Reset or first time in
      st_set_form_vars
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      @changed = session[:changed] = false
      replace_right_cell(:action => "st_new")
      return
    end
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def st_form_field_changed
    assert_privileges(session&.fetch_path(:edit, :rec_id) ? "catalogitem_edit" : "catalogitem_new")

    id = session[:edit][:rec_id] || 'new'
    return unless load_edit("st_edit__#{id}", "replace_cell__explorer")

    @group_idx = false
    default_entry_point("generic", "composite") if params[:display]
    st_get_form_vars
    changed = (@edit[:new] != @edit[:current])
    build_automate_tree(:automate_catalog) # Build Catalog Items tree
    render :update do |page|
      page << javascript_prologue
      page.replace("basic_info_div", :partial => "form_basic_info") if params[:resource_id] || params[:display]
      page.replace("resources_info_div", :partial => "form_resources_info") if params[:resource_id] || @group_idx
      if params[:display]
        page << "miq_tabs_show_hide('#details_tab', '#{(params[:display] == "1")}')"
      end
      if changed != session[:changed]
        session[:changed] = changed
        page << javascript_for_miq_button_visibility(changed)
      end
      page << "miqSparkle(false);"
    end
  end

  def st_upload_image
    assert_privileges("st_catalog_edit")

    err = false
    identify_catalog(params[:id])
    if params[:pressed]
      @record.picture = nil
      @record.save
      msg = _("Custom Image successfully removed")
    elsif params[:upload] && params[:upload][:image] &&
          params[:upload][:image].respond_to?(:read)
      ext = params[:upload][:image].original_filename.split(".").last.downcase
      if !%w[png jpg].include?(ext)
        msg = _("Custom Image must be a .png or .jpg file")
        err = true
      else
        picture = {:content   => params[:upload][:image].read,
                   :extension => ext}
        if @record.picture.nil?
          @record.picture = Picture.new(picture)
        else
          @record.picture.update(picture)
        end
        @record.save
        msg = _("Custom Image file \"%{name}\" successfully uploaded") %
              {:name => params[:upload][:image].original_filename}
      end
    else
      msg = _("Use the Choose file button to locate a .png or .jpg image file")
      err = true
    end
    params[:id] = x_build_node_id(@record) # Get the tree node id
    add_flash(msg, err == true ? :error : nil)
    respond_to do |format|
      format.js { replace_right_cell(:replace_trees => trees_to_replace(%i[sandt svccat stcat])) }
      format.html do # HTML, send error screen
        explorer
      end
      format.any { head :not_found } # Anything else, just send 404
    end
  end

  def resource_delete
    assert_new_or_edit_by_service_type

    return unless load_edit("st_edit__#{params[:id]}", "replace_cell__explorer")

    @edit[:new][:rsc_groups][params[:grp_id].to_i].each do |r|
      next if r[:id].to_s != params[:rec_id]

      @edit[:new][:available_resources][r[:resource_id]] = r[:name] # add it back to available resources pulldown
      @edit[:new][:selected_resources].delete(r[:resource_id]) # delete it from to selected resources
      @edit[:new][:rsc_groups][params[:grp_id].to_i].delete(r) # delete element from group
      rearrange_provision_order(@edit[:new][:rsc_groups], r[:provision_index])
    end

    # if resource has been deleted from group, rearrange groups incase group is now empty.
    rearrange_groups_array
    build_automate_tree(:automate_catalog) # Build Catalog Items tree
    changed = (@edit[:new] != @edit[:current])
    @available_catalogs = available_catalogs.sort # Get available catalogs with tenants and ancestors
    @tenants_tree = build_tenants_tree # Build the tree with available tenants
    fetch_zones
    render :update do |page|
      page << javascript_prologue
      page.replace("basic_info_div", :partial => "form_basic_info")
      page.replace("resources_info_div", :partial => "form_resources_info")
      if changed != session[:changed]
        session[:changed] = changed
        page << javascript_for_miq_button_visibility(changed)
      end
      page << "miqSparkle(false);"
    end
  end

  # Edit user or group tags
  def st_tags_edit
    assert_privileges("catalogitem_tag")
    tags_edit("ServiceTemplate")
  end

  # Edit user or group tags
  def ot_tags_edit
    assert_privileges("orchestration_template_tag")
    tags_edit("OrchestrationTemplate")
  end

  # Edit user or group tags
  def tags_edit(klass)
    case params[:button]
    when "cancel"
      x_edit_tags_cancel
    when "save", "add"
      x_edit_tags_save
    when "reset", nil # Reset or first time in
      x_edit_tags_reset(klass) # pass in the DB
    end
  end

  def get_ae_tree_edit_key(type)
    case type
    when 'provision'   then :fqname
    when 'retire'      then :retire_fqname
    when 'reconfigure' then :reconfigure_fqname
    end
  end
  private :get_ae_tree_edit_key

  def need_prov_dialogs?(type)
    !type.starts_with?('generic')
  end
  helper_method :need_prov_dialogs?

  def assert_new_or_edit_by_service_type
    service_type = session&.fetch_path(:edit, :current, :service_type)
    edit_feature = "atomic_catalogitem_edit"
    new_feature  = "atomic_catalogitem_new"

    if service_type == "composite"
      edit_feature = "catalogitem_edit"
      new_feature  = "catalogitem_new"
    end

    assert_privileges(session&.fetch_path(:edit, :rec_id) ? edit_feature : new_feature)
  end

  private :assert_new_or_edit_by_service_type

  def ae_tree_select_toggle
    assert_new_or_edit_by_service_type

    @edit = session[:edit]
    self.x_active_tree = :sandt_tree
    at_tree_select_toggle(:automate_catalog, get_ae_tree_edit_key(@edit[:ae_field_typ]))
    x_node_set(@edit[:active_id], :automate_catalog_tree) if params[:button] == 'submit'
    session[:edit] = @edit
  end

  # Method to open the workflows dialog box
  # params[:field]    => :fqname || :retire_fqname || :reconfigure_fqname
  # params[:selected] => Holds the value of the *_configuration_script_id
  def embedded_workflows_modal
    @edit = session[:edit]
    type = ENTRY_POINT_TYPES[params[:field].to_sym][:type]
    render :update do |page|
      page << javascript_prologue
      page.replace_html("#{type}-workflows", :partial => "embedded_workflows_modal",
                                             :locals  => {
                                               :field    => params[:field],
                                               :selected => params[:selected],
                                               :type     => type,
                                             })
      page << javascript_show(params[:field])
      page << javascript_show("#{params[:field]}_modal")
      page << "$('##{params[:type]}_modal').addClass('modal fade in');"
    end
  end

  def ae_tree_select_discard
    assert_new_or_edit_by_service_type

    ae_tree_key = get_ae_tree_edit_key(params[:typ])
    @edit = session[:edit]
    @edit[:new][params[:typ]] = nil
    @edit[:new][ae_tree_key] = ''
    # build_automate_tree(:automate_catalog) # Build Catalog Items tree unless @edit[:ae_tree_select]
    render :update do |page|
      page << javascript_prologue
      @changed = (@edit[:new] != @edit[:current])
      x_node_set(@edit[:active_id], :automate_catalog_tree)
      page << javascript_hide("ae_tree_select_div")
      page << javascript_hide("blocker_div")
      page << "$('##{ae_tree_key}_remove').attr('disabled', true);"
      page << "$('##{ae_tree_key}').val('#{@edit[:new][ae_tree_key]}');"
      page << "$('##{ae_tree_key}').prop('title', '#{@edit[:new][ae_tree_key]}');"
      @edit[:ae_tree_select] = false
      page << javascript_for_miq_button_visibility(@changed)
      page << "miqTreeActivateNodeSilently('automate_catalog_tree', 'root');"
      page << "miqSparkle(false);"
    end
    session[:edit] = @edit
  end

  def ae_tree_select
    assert_new_or_edit_by_service_type

    @edit = session[:edit]
    at_tree_select(get_ae_tree_edit_key(@edit[:ae_field_typ]))
    session[:edit] = @edit
  end

  def svc_catalog_provision
    assert_privileges("svc_catalog_provision")
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]
    st = find_record_with_rbac(ServiceTemplate, checked[0])
    @right_cell_text = _("Order Service \"%{name}\"") % {:name => st.name}
    ra = nil
    st.resource_actions.each do |r|
      next unless r.action.downcase == "provision" && r.dialog_id

      # find the first provision action, run the dialog
      ra = r
      break
    end
    if ra
      @explorer = true
      options = {}
      options[:header] = @right_cell_text
      options[:target_id] = st.id
      options[:target_kls] = st.class.name
      options[:dialog_locals] = DialogLocalService.new.determine_dialog_locals_for_svc_catalog_provision(
        ra, st, svc_catalog_provision_finish_submit_endpoint
      )
      @in_a_form = true
      @dialog_locals = options[:dialog_locals]
      replace_right_cell(:action => "dialog_provision", :dialog_locals => options[:dialog_locals])
    else
      # if catalog item has no dialog and provision button was pressed from list view
      add_flash(_("No Ordering Dialog is available"), :warning)
      replace_right_cell
    end
  end

  def servicetemplate_ownership
    @explorer = true
    set_ownership
    replace_right_cell(:action => 'ownership')
  end

  def st_catalog_edit
    assert_privileges((params[:id] || session&.fetch_path(:edit, :rec_id)) ? "st_catalog_edit" : "st_catalog_new")

    case params[:button]
    when "cancel"
      if session[:edit][:rec_id]
        add_flash(_("Edit of Catalog \"%{name}\" was cancelled by the user") % {:name => session[:edit][:new][:name]})
      else
        add_flash(_("Add of new Catalog was cancelled by the user"))
      end
      @sb[:action] = @edit = nil
      @in_a_form = false
      replace_right_cell
    when "save", "add"
      add_flash(_("Catalog \"%{name}\" was saved") % {:name => params[:name]})
      @changed = session[:changed] = false
      @in_a_form = false
      @edit = session[:edit] = nil
      replace_right_cell(:replace_trees => trees_to_replace(%i[sandt svccat stcat]))
    when nil # First time in
      st_catalog_set_form_vars
      @changed = session[:changed] = false
      replace_right_cell(:action => "st_catalog_edit")
      nil
    end
  end

  def template_to_node_name(object)
    ORCHESTRATION_TEMPLATES_NODES[object.class.name]
  end

  def node_name_to_template_name(node_name)
    node_elems = node_name.split('-')
    if node_elems[1]
      ORCHESTRATION_TEMPLATES_NODES.invert[node_elems[1]]
    end
  end

  def ot_edit
    assert_privileges("orchestration_template_edit")
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]
    @record = find_record_with_rbac(OrchestrationTemplate, checked[0])
    if @record.in_use?
      add_flash(_("Orchestration template \"%{name}\" is read-only and cannot be edited.") %
        {:name => @record.name}, :error)
      get_node_info(x_node)
      replace_right_cell(:action => x_node)
      return
    end
    ot_edit_set_form_vars(_("Editing %{record_name}"))
    replace_right_cell(:action => "ot_edit")
  end

  def ot_copy
    assert_privileges("orchestration_template_copy")
    ot_edit_set_form_vars(_("Copying %{record_name}"))
    @edit[:new][:name] = @edit[:current][:name] = _("Copy of %{name}") % {:name => @edit[:new][:name]}
    replace_right_cell(:action => "ot_copy")
  end

  def ot_remove_submit
    assert_privileges("orchestration_template_remove")
    elements = find_records_with_rbac(OrchestrationTemplate, checked_or_params)
    elements.each do |ot|
      if ot.in_use?
        add_flash(_("Orchestration template \"%{name}\" is read-only and cannot be deleted.") %
          {:name => ot.name}, :error)
      else
        begin
          ot.remote_proxy = true
          ot.destroy
        rescue StandardError => bang
          add_flash(_("Error during 'Orchestration Template Deletion': %{error_message}") %
            {:error_message => bang.message}, :error)
        else
          add_flash(_("Orchestration Template \"%{name}\" was deleted.") % {:name => ot.name})
        end
      end
    end
    self.x_node = elements.length > 1 ? 'root' : "xx-#{template_to_node_name(elements[0])}"
    replace_right_cell(:replace_trees => trees_to_replace([:ot]))
  end

  def ot_add
    assert_privileges("orchestration_template_add")
    ot_type = x_node == "root" ? "ManageIQ::Providers::Amazon::CloudManager::OrchestrationTemplate" : node_name_to_template_name(x_node)
    @edit = {:new => {:type => ot_type}}
    @edit[:current] = @edit[:new].dup
    @edit[:key] = "ot_add__new"
    @right_cell_text = _("Adding a new Orchestration Template")
    @in_a_form = true
    replace_right_cell(:action => "ot_add")
  end

  def service_dialog_from_ot
    assert_privileges("service_dialog_from_ot")
    ot = OrchestrationTemplate.find(params[:id])
    @right_cell_text = _("Adding a new Service Dialog from Orchestration Template \"%{name}\"") % {:name => ot.name}
    # id for create service dialog from ot for react form
    @edit = {:rec_id => ot.id}
    @in_a_form = true
    replace_right_cell(:action => "service_dialog_from_ot")
  end

  def ot_show
    assert_privileges("orchestration_templates_view")
    id = params.delete(:id)
    ot = OrchestrationTemplate.find(id)
    self.x_active_tree = :ot_tree
    self.x_active_accord = 'ot'
    x_tree_init(:ot_tree, :ot, "OrchestrationTemplate") unless x_tree
    ot_type = template_to_node_name(ot)
    x_tree[:open_nodes].push("xx-#{ot_type}") unless x_tree[:open_nodes].include?("xx-#{ot_type}")
    self.x_node = "ot-#{ot.id}"
    x_tree[:open_nodes].push(x_node)
    add_flash(params[:flash_message]) if params.key?(:flash_message)
    explorer
  end

  private

  # Method to return the entry point name and its automation type
  # Used for summary and edit pages.
  def resource_action_entry_point(resource_action)
    cs_id = resource_action.configuration_script_id
    if cs_id
      workflow = ConfigurationScriptPayload.find_by(:id => cs_id)
      {:name => workflow&.name, :type => embedded_workflow_key, :configuration_script_id => cs_id}
    else
      {:name => resource_action.fqname, :type => embedded_automate_key, :configuration_script_id => nil}
    end
  end

  def build_tenants_tree
    tenants = @record ? @record.additional_tenants : Tenant.where(:id => @edit[:new][:tenant_ids])
    catalog_bundle = @edit.present? && @edit[:key] && @edit[:key].starts_with?('st_edit') # Get the info if adding/editing Catalog Item or Bundle; not important if only displaying
    TreeBuilderTenants.new('tenants_tree', @sb, true, :additional_tenants => tenants, :selectable => @edit.present?, :show_tenant_tree => ansible_playbook_type? || terraform_template_type?, :catalog_bundle => catalog_bundle)
  end

  def svc_catalog_provision_finish_submit_endpoint
    role_allows?(:feature => "miq_request_show_list", :any => true) ? "/miq_request/show_list" : "/catalog/explorer"
  end

  def ansible_playbook_type?
    prov_type = if params[:st_prov_type]
                  params[:st_prov_type]
                elsif @record
                  @record.prov_type
                elsif @edit
                  @edit[:new][:st_prov_type]
                end
    if prov_type == 'generic_ansible_playbook'
      @current_region = MiqRegion.my_region.region
    end
    prov_type == 'generic_ansible_playbook'
  end

  def terraform_template_type?
    prov_type = if params[:st_prov_type]
                  params[:st_prov_type]
                elsif @record
                  @record.prov_type
                elsif @edit
                  @edit[:new][:st_prov_type]
                end
    if prov_type == 'generic_terraform_template'
      @current_region = MiqRegion.my_region.region
    end
    prov_type == 'generic_terraform_template'
  end

  # Get all the available Catalogs
  def available_catalogs
    Rbac.filtered(ServiceTemplateCatalog.all).collect do |sc|
      if sc.tenant.present?
        tenant_names = []
        sc.tenant.ancestor_ids.map do |t|
          tenant_names.push(Tenant.find_by(:id => t).name)
        end
        tenant_names.push(sc.tenant.name)
        tenant_names = tenant_names.join("/")
      end
      [tenant_names.present? ? "#{tenant_names}/" + sc.name : sc.name, sc.id]
    end
  end

  def remove_resources_display(remove_resources)
    case remove_resources
    when 'no_without_playbook', 'no_with_playbook'
      _('No')
    when 'pre_with_playbook'
      _('Before Playbook runs')
    when 'post_with_playbook'
      _('After Playbook runs')
    else
      _('Yes')
    end
  end
  helper_method :remove_resources_display

  def features
    [
      {
        :role     => "svc_catalog_accord",
        :role_any => true,
        :name     => :svccat,
        :title    => _("Service Catalogs")
      },

      {
        :role     => "catalog_items_accord",
        :role_any => true,
        :name     => :sandt,
        :title    => _("Catalog Items")
      },
      {
        :role     => "orchestration_templates_accord",
        :role_any => true,
        :name     => :ot,
        :title    => _("Orchestration Templates")
      },
      {
        :role     => "st_catalog_accord",
        :role_any => true,
        :name     => :stcat,
        :title    => _("Catalogs")
      }
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def class_service_template(prov_type)
    if content_library?
      ManageIQ::Providers::Vmware::InfraManager::OvfServiceTemplate
    elsif prov_type.starts_with?('generic')
      prov_type.gsub(/(generic)(_.*)?/, 'service_template\2').classify.constantize
    else
      ServiceTemplate
    end
  end

  def atomic_req_submit
    id = session[:edit][:req_id] || "new"
    return unless load_edit("prov_edit__#{id}", "show_list")

    if @edit[:new][:name].blank?
      # check for service template required fields before creating a request
      add_flash(_("Name is required"), :error)
    end
    if @edit[:new][:st_prov_type] == 'generic' && @edit[:new][:generic_subtype].blank?
      add_flash(_('Subtype is required.'), :error)
    end

    # for Ansible Tower items, check for Provider first
    if @edit[:new][:st_prov_type] == 'generic_ansible_tower' || @edit[:new][:st_prov_type] == 'generic_awx'
      if @edit[:new][:manager_id].blank?
        add_flash(_("Provider is required, please select one from the list"), :error)
      elsif @edit[:new][:template_id].blank?
        # ensure Job Template is selected as well, required field
        add_flash(_("Template is required, please select one from the list"), :error)
      end
    end

    # For Orchestration catalog item, reverse edit flow and check Template selection first
    if @edit[:new][:st_prov_type] == 'generic_orchestration'
      if @edit[:new][:template_id].blank?
        add_flash(_("Orchestration Template is required, please select one from the list"), :error)
      elsif @edit[:new][:manager_id].blank?
        # ensure Provider is selectied, required field
        add_flash(_("Provider is required, please select one from the list"), :error)
      end
    end

    # For Content Library OVF TEmplate catalog item
    if @edit[:new][:st_prov_type] == 'generic_ovf_template'
      add_flash(_("OVF Template is required, please select one from the list"), :error) if @edit[:new][:ovf_template_id].blank?
      add_flash(_("Resource Pool is required, please select one from the list"), :error) if @edit[:new][:resource_pool_id].blank?
      validate_vm_name if @edit[:new][:vm_name].present?
    end

    add_flash(_("Provisioning Entry Point is required"), :error) if @edit[:new][:fqname].blank?
    validate_price
    # Check for a Dialog if Display in Catalog is selected
    dialog_catalog_check

    # Check the validity of the entry points
    %i[fqname reconfigure_fqname retire_fqname].each do |fqname|
      type = entry_point_fields(fqname)[:type]
      if embedded_automate(@edit[:new][type])
        next if @edit[:new][fqname].blank? || !MiqAeClass.find_homonymic_instances_across_domains(current_user, @edit[:new][fqname]).empty?

        case fqname
        when :fqname
          add_flash(_('Please correct invalid Provisioning Entry Point prior to saving'), :error)
        when :reconfigure_fqname
          add_flash(_('Please correct invalid Reconfigure Entry Point prior to saving'), :error)
        when :retire_fqname
          add_flash(_('Please correct invalid Retirement Entry Point prior to saving'), :error)
        end
      end
    end

    # set request for non generic ST
    if @edit[:wf] && need_prov_dialogs?(@edit[:new][:st_prov_type])
      request = @edit[:wf].make_request(@edit[:req_id], @edit[:new])
      if request && request&.errors.present?
        request.errors.each do |error|
          add_flash("#{error.attribute.to_s.capitalize} #{error.message}", :error)
        end
      else
        validate_fields
      end
    end

    if @flash_array
      javascript_flash
      return
    end
    get_form_vars # need to get long_description
    if @edit[:new][:st_prov_type] == "generic_container_template"
      st = if @edit[:rec_id]
             ServiceTemplateContainerTemplate.find_by(:id => @edit[:rec_id]).update_catalog_item(add_container_template_vars)
           else
             ServiceTemplateContainerTemplate.create_catalog_item(add_container_template_vars)
           end
    elsif @edit[:new][:st_prov_type] == 'generic_ovf_template'
      st = if @edit[:rec_id]
             ManageIQ::Providers::Vmware::InfraManager::OvfServiceTemplate.find_by(:id => @edit[:rec_id]).update_catalog_item(set_record_vars_ovf_template)
           else
             ManageIQ::Providers::Vmware::InfraManager::OvfServiceTemplate.create_catalog_item(set_record_vars_ovf_template, User.current_user)
           end
    else
      st = if @edit[:rec_id]
             ServiceTemplate.find_by(:id => @edit[:rec_id])
           else
             class_service_template(@edit[:new][:st_prov_type]).new
           end
      common_st_record_vars(st)
      add_orchestration_template_vars(st) if st.kind_of?(ServiceTemplateOrchestration)
      add_ansible_tower_job_template_vars(st) if st.kind_of?(ServiceTemplateAnsibleTower) || st.kind_of?(ServiceTemplateAwx)
      add_server_profile_template_vars(st) if @edit[:new][:st_prov_type] == 'cisco_intersight'
      st.service_type = "atomic"

      if request
        st.remove_all_resources
        st.add_resource(request) if need_prov_dialogs?(@edit[:new][:st_prov_type])
      end
    end
    st.currency = @edit[:new][:currency] ? Currency.find_by(:id => @edit[:new][:currency].to_i) : nil
    st.price    = st.currency ? @edit[:new][:price] : nil if @edit[:new][:price]

    if st.save
      set_resource_action(st) unless st.kind_of?(ServiceTemplateContainerTemplate)
      flash_key = params[:button] == "save" ? _("Service Catalog Item \"%{name}\" was saved") : _("Service Catalog Item \"%{name}\" was added")
      add_flash(flash_key % {:name => @edit[:new][:name]})
      @changed = session[:changed] = false
      @in_a_form = false
      @edit = session[:edit] = @record = nil
      replace_right_cell(:replace_trees => trees_to_replace(%i[sandt svccat stcat]))
    else
      st.errors.each do |error|
        add_flash("#{error.attribute.to_s.capitalize} #{error.message}", :error)
      end
      @changed = session[:changed] = (@edit[:new] != @edit[:current])
      javascript_flash
    end
  end

  def service_template_list(scope, options = {})
    @no_checkboxes = x_active_tree == :svccat_tree
    if x_active_tree == :svccat_tree
      @gtl_small_tiles = true
      @row_button = true if role_allows?(:feature => 'svc_catalog_provision') # Show a button instead of the checkbox
      options[:gtl_dbname] = :catalog
    end
    options[:named_scope] = scope
    process_show_list(options)
  end

  def ot_edit_set_form_vars(right_cell_text)
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]
    @record = checked[0] ? find_record_with_rbac(OrchestrationTemplate, checked[0]) : OrchestrationTemplate.new
    @edit = {:current => {:name        => @record.name,
                          :description => @record.description,
                          :content     => @record.content,
                          :draft       => @record.draft,
                          :type        => @record.type,
                          :manager_id  => @record.ems_id},
             :rec_id  => @record.id}

    @edit[:current][:available_managers] = available_orchestration_managers_for_template_type(@record.type)
    @edit[:new] = @edit[:current].dup
    @edit[:key] = "ot_edit__#{@record.id}"
    @right_cell_text = right_cell_text % {:record_name => @record.name}
    @in_a_form = true
  end

  def st_catalog_set_form_vars
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]

    @record = checked[0] ? find_record_with_rbac(ServiceTemplateCatalog, checked[0]) : ServiceTemplateCatalog.new
    @right_cell_text = if @record.id
                         _("Editing Catalog \"%{name}\"") % {:name => @record.name}
                       else
                         _("Adding a new Catalog")
                       end
    @edit = {}
    @edit[:new] = {}
    @edit[:rec_id] = @record.id
    @edit[:new][:name] = @record.name
    @edit[:current] = {} # because of locking tree in replace_right_cell method
    @in_a_form = true
  end

  def st_catalog_delete
    assert_privileges("st_catalog_delete")
    elements = []
    if params[:id]
      elements.push(params[:id])
      process_elements(elements, ServiceTemplateCatalog, "destroy") unless elements.empty?
      self.x_node = "root"
    else # showing 1 element, delete it
      elements = find_checked_items
      if elements.empty?
        add_flash(_("No Catalogs were selected for deletion"), :error)
      end
      process_elements(elements, ServiceTemplateCatalog, "destroy") unless elements.empty?
    end
    params[:id] = nil
    replace_right_cell(:replace_trees => trees_to_replace(%i[sandt svccat stcat]))
  end

  def trees_to_replace(trees)
    trees_to_replace = []
    trees_to_replace.push(:stcat) if trees.include?(:stcat) && role_allows?(:feature => "st_catalog_accord")
    trees_to_replace.push(:sandt) if trees.include?(:sandt) && role_allows?(:feature => "catalog_items_view")
    trees_to_replace.push(:svccat) if trees.include?(:svccat) && role_allows?(:feature => "svc_catalog_accord")
    trees_to_replace.push(:ot) if trees.include?(:ot) &&
                                  role_allows?(:feature => "orchestration_templates_accord", :any => true)
    trees_to_replace
  end

  # Method to prepare the data needed for resource_actions
  # prefix[:name] = 'Provision' || 'Reconfigure' || 'Retirement'
  # prefix[:type] = :provision || :reconfigure || :retire
  # key           = :fqname || :reconfigure_fqname || :retire_fqname
  def entry_point_keys
    ENTRY_POINT_TYPES.map do |key, prefix|
      {
        :name               => prefix[:name],
        :automate_edit_key  => key,
        :type_key           => "#{prefix[:type]}_entry_point_type".to_sym,
        :workflows_edit_key => "#{prefix[:type]}_configuration_script_id".to_sym
      }
    end
  end

  def set_resource_action(st)
    d = @edit[:new][:dialog_id].nil? ? nil : Dialog.where(:id => @edit[:new][:dialog_id]).first

    entry_point_keys.each do |action|
      ra = st.resource_actions
             .create_with(
               :configuration_script_id => @edit[:new][action[:workflows_edit_key]],
               :ae_attributes           => {:service_action => action[:name]}
             )
             .find_or_initialize_by(:action => action[:name])
      if @edit[:new][action[:automate_edit_key]].blank? && @edit[action[:workflows_edit_key]].blank?
        st.resource_actions.where(:action => action[:name]).first.try(:destroy)
      else
        fqname                  = @edit[:new][action[:automate_edit_key]]  if @edit[:new][action[:type_key]] == embedded_automate_key
        configuration_script_id = @edit[:new][action[:workflows_edit_key]] if @edit[:new][action[:type_key]] == embedded_workflow_key
        ra.update!(:dialog => d, :fqname => fqname, :configuration_script_id => configuration_script_id)
      end
    end
  end

  # sets record variables common to both atomic and composite service templates
  def common_st_record_vars(st)
    st.name = @edit[:new][:name]
    st.description = @edit[:new][:description]
    st.long_description = @edit[:new][:display] ? @edit[:new][:long_description] : nil
    st.provision_cost = @edit[:new][:provision_cost]
    st.display = @edit[:new][:display]
    st.service_template_catalog = if @edit[:new][:catalog_id].blank?
                                    nil
                                  else
                                    ServiceTemplateCatalog.find(@edit[:new][:catalog_id])
                                  end
    st.prov_type = @edit[:new][:st_prov_type]
    st.generic_subtype = @edit[:new][:generic_subtype] if @edit[:new][:st_prov_type] == 'generic'
    st.zone_id = @edit[:new][:zone_id]
    st.additional_tenants = Tenant.where(:id => @edit[:new][:tenant_ids]) # Selected Additional Tenants in the tree
    st.currency = @edit[:new][:currency] ? Currency.find_by(:id => @edit[:new][:currency].to_i) : nil
    st.price    = st.currency ? @edit[:new][:price] : nil if @edit[:new][:price]
  end

  def st_set_record_vars(st)
    common_st_record_vars(st)
    st.remove_all_resources
    @add_rsc = true
    unless @edit[:new][:selected_resources].empty?
      @edit[:new][:selected_resources].each do |r|
        rsc = ServiceTemplate.find(r)
        @edit[:new][:rsc_groups].each_with_index do |groups, i|
          groups.each do |sr|
            options = {}
            options[:group_idx] = i
            options[:provision_index] = sr[:provision_index]
            options[:start_action] = sr[:start_action]
            options[:stop_action] = sr[:stop_action]
            options[:start_delay] = sr[:start_delay].to_i
            options[:stop_delay] = sr[:stop_delay].to_i
            options[:scaling_min] = sr[:scaling_min].to_i
            options[:scaling_max] = sr[:scaling_max].to_i
            next unless sr[:resource_id].to_s == rsc.id.to_s

            begin
              st.add_resource(rsc, options)
            rescue MiqException::MiqServiceCircularReferenceError => bang
              @add_rsc = false
              add_flash(_("Error during 'Resource Add': %{error_message}") %
                {:error_message => bang.message}, :error)
              break
            end
          end
        end
      end
    end
  end

  # common code for both st/at set_form_vars
  def set_form_vars
    @edit[:new][:name] = @record.name
    @edit[:new][:description] = @record.description
    @edit[:new][:long_description] = @record.long_description
    @edit[:new][:provision_cost] = @record.provision_cost
    @edit[:new][:display] = @record.display || false
    @edit[:new][:catalog_id] = @record.service_template_catalog.try(:id)
    @edit[:new][:dialog_id] = nil # initialize
    @edit[:new][:st_prov_type] ||= @record.prov_type
    @edit[:new][:generic_subtype] = @record.generic_subtype || "custom" if @edit[:new][:st_prov_type] == 'generic'
    @edit[:new][:tenant_ids] = @record.additional_tenant_ids
    @tenants_tree = build_tenants_tree # Build the tree with available tenants
    @available_catalogs = available_catalogs.sort # Get available catalogs with tenants and ancestors
    @additional_tenants = @edit[:new][:tenant_ids].map(&:to_s) # Get ids of selected Additional Tenants in the Tenants tree
    available_orchestration_templates if @record.kind_of?(ServiceTemplateOrchestration)
    available_ansible_tower_managers if @record.kind_of?(ServiceTemplateAnsibleTower) || @record.kind_of?(ServiceTemplateAwx)
    available_container_managers if @record.kind_of?(ServiceTemplateContainerTemplate)
    fetch_zones
    @edit[:new][:zone_id] = @record.zone_id

    @edit[:new][:currency] = @record.currency ? @record.currency.id : nil
    @edit[:new][:code_currency] = @record.currency ? code_currency_label(@record.currency.id) : _("Price / Month")
    @edit[:new][:price] = @record.price

    # initialize entry_point fields and its type to nil
    ENTRY_POINT_TYPES.each do |key, _prefix|
      fields = entry_point_fields(key)
      @edit[:new][key] = @edit[:new][fields[:type]] = @edit[:new][fields[:configuration_script_id]] = nil
      @edit[:new][fields[:previous]] = {:embedded_automate => nil, :embedded_workflow => nil}
      @edit[:new][fields[:type]] = default_entry_point_type
    end

    @record.resource_actions.each do |ra|
      @edit[:new][:dialog_id] = ra.dialog_id.to_i

      # To display the automation_type and its entry point values in edit page.
      entry_point = resource_action_entry_point(ra)

      if ra.action.downcase == 'provision'
        @edit[:new][:fqname] = entry_point[:name]
        @edit[:new][:provision_entry_point_type] = entry_point[:type]
        @edit[:new][:provision_configuration_script_id] = entry_point[:configuration_script_id]
      elsif ra.action.downcase == 'reconfigure'
        @edit[:new][:reconfigure_fqname] = entry_point[:name]
        @edit[:new][:reconfigure_entry_point_type] = entry_point[:type]
        @edit[:new][:reconfigure_configuration_script_id] = entry_point[:configuration_script_id]
      elsif ra.action.downcase == 'retirement'
        @edit[:new][:retire_fqname] = entry_point[:name]
        @edit[:new][:retire_entry_point_type] = entry_point[:type]
        @edit[:new][:retire_configuration_script_id] = entry_point[:configuration_script_id]
      end
    end
    load_available_dialogs
    @right_cell_text = if @record.id.blank?
                         _("Adding a new Service Catalog Item")
                       else
                         _("Editing Service Catalog Item \"%{name}\"") % {:name => @record.name}
                       end
    build_automate_tree(:automate_catalog) # Build Catalog Items tree
    form_available_vars_ovf_template if @record.kind_of?(ManageIQ::Providers::Vmware::InfraManager::OvfServiceTemplate)
  end

  def fetch_zones
    @zones = Zone.visible.in_my_region.order(Zone.arel_table[:description].lower).pluck(:description, :id)
  end

  def st_set_form_vars
    @edit = {}
    @edit[:rec_id] = @record.id
    @edit[:key] = "st_edit__#{@record.id || "new"}"
    @edit[:url] = "servicetemplate_edit"
    @edit[:new] = {}
    @edit[:current] = {}
    set_form_vars
    # Set the default entry points if the record not yet in the DB
    default_entry_point("generic", "composite") if @record.id.nil?
    @edit[:new][:service_type] = "composite"
    @edit[:new][:rsc_groups] = []
    @edit[:new][:selected_resources] = []

    len = @record.service_resources.size
    len.times do |l|
      next unless @record.group_has_resources?(l)

      @edit[:new][:rsc_groups][l] ||= []
      @record.each_group_resource(l) do |sr|
        @edit[:new][:selected_resources].push(sr.resource_id)
        # storing keys that are needed in ui in hash instead of storing an object
        r = {}
        r[:name] = sr.resource_name
        r[:id] = sr.id
        r[:resource_id] = sr.resource_id
        r[:start_action] = sr.start_action || "Power On"
        r[:stop_action] = sr.stop_action || "Shutdown"
        r[:start_delay] = sr.start_delay || 0
        r[:stop_delay] = sr.stop_delay || 0
        r[:scaling_min] = sr.scaling_min || 1
        r[:scaling_max] = sr.scaling_max || sr.scaling_min
        r[:provision_index] = sr.provision_index || 0
        @edit[:new][:rsc_groups][l].push(r)
      end
    end
    # add one extra group to show in pulldown so resources can be moved into it.
    @edit[:new][:rsc_groups].push([]) if @edit[:new][:selected_resources].length > 1
    @edit[:new][:provision_order] = recalculate_provision_order

    @edit[:new][:available_resources] = {}
    get_available_resources("ServiceTemplate")
    load_available_dialogs
    @edit[:current] = copy_hash(@edit[:new])
    @right_cell_text = if @record.id.blank?
                         _("Adding a new Catalog Bundle")
                       else
                         _("Editing Catalog Bundle \"%{name}\"") % {:name => @record.name}
                       end

    @in_a_form = true
  end

  def rearrange_groups_array
    # keep count of how many groups are deleted
    g_idx = 0
    # flag to check whether an empty group was deleted so next group elements can be moved up
    arr_delete = false

    @edit[:new][:rsc_groups].each_with_index do |group, i|
      if group.empty?
        g_idx = i
        arr_delete = true
      else
        # update group_idx of resources in group incase previous one got deleted
        @edit[:new][:rsc_groups].delete_at(g_idx) if arr_delete
        arr_delete = false
        g_idx = 0
      end
    end
    # delete any empty groups at the end of the groups array and leave only 1 empty group
    # i.e if on screen resources were assigned to group 1 & 2, pulldown had 1,2,3 in it, now if all resources were moved to group 1, get rid of 3 from pulldown
    prev = 0
    @edit[:new][:rsc_groups].each_with_index do |g, i|
      if i.zero?
        prev = g
      end
      if i.positive? && prev.empty? && g.empty?
        @edit[:new][:rsc_groups].delete_at(i)
      end
      prev = g
    end

    # add another empty element to groups array if it doesn't exist to keep one extra in group pulldown
    @edit[:new][:rsc_groups].push([]) if @edit[:new][:selected_resources].length > 1 && !@edit[:new][:rsc_groups][@edit[:new][:rsc_groups].length - 1].empty?
  end

  def get_available_resources(kls)
    @edit[:new][:available_resources] = {}
    Rbac.filtered(kls.constantize.public_service_templates.where("(type is null or type != 'ServiceTemplateAnsiblePlaybook') and service_type != 'composite'")).select(:id, :name).each do |r|
      # don't add the servicetemplate record that's being edited, or add all vm templates
      if r.id.to_s != @edit[:rec_id].to_s && !@edit[:new][:selected_resources].include?(r.id)
        @edit[:new][:available_resources][r.id] = r.name
      end
    end
  end

  # Returns true if the edit_new's field is 'embedded_automate'.
  def automate_field(edit_new, field)
    type = entry_point_fields(field)[:type]
    embedded_automate(edit_new[type])
  end

  # Method to set the entry_point's type, value and previous value.
  # type     = provision_entry_point_type || reconfigure_entry_point_type || retire_entry_point_type
  # previous = fqname_previous || reconfigure_fqname_previous || retire_fqname_previous
  def default_entry_point(prov_type, service_type)
    klass = class_service_template(prov_type)
    ENTRY_POINT_TYPES.each do |key, _prefix|
      fields            = entry_point_fields(key)
      type              = fields[:type]
      previous          = fields[:previous]

      # sets the type to embedded_automate || embedded_workflow
      @edit[:new][type] = params[type] || default_entry_point_type

      # sets the value of entry_point
      is_automate       = embedded_automate(@edit[:new][type])
      entry_point       = nil
      if is_automate
        entry_point = klass.default_provisioning_entry_point(service_type) if key == :fqname
        entry_point = klass.default_retirement_entry_point if key == :retire_fqname
        entry_point = klass.default_reconfiguration_entry_point if key == :reconfigure_fqname
      end
      @edit[:new][key] = is_automate ? entry_point : nil

      # sets the value of previously selected entry_point_value
      @edit[:new][previous] = {:embedded_automate => nil, :embedded_workflow => nil}
      previous_type = is_automate ? embedded_automate_key : embedded_workflow_key
      @edit[:new][previous][previous_type.to_sym] = @edit[:new][key]
    end
  end

  def get_form_vars
    copy_params_if_present(@edit[:new], params, %i[st_prov_type name description provision_cost catalog_id dialog_id generic_subtype long_description zone_id price retire_fqname reconfigure_fqname fqname])

    @edit[:new][:display] = params[:display] == "1" if params[:display] # @edit[:new][:display] should't be changed if params[:display] is not set
    # saving it in @edit as well, to use it later because prov_set_form_vars resets @edit[:new]
    @edit[:st_prov_type] = @edit[:new][:st_prov_type]
    @edit[:new][:long_description] = @edit[:new][:long_description].to_s + "..." if params[:transOne]
    fetch_zones
    checked_tenants if params[:check] # Save checked Additional Tenants to @edit

    @tenants_tree = build_tenants_tree # Build the tree with available tenants
    @available_catalogs = available_catalogs.sort # Get available catalogs with tenants and ancestors
    @additional_tenants = @edit[:new][:tenant_ids].map(&:to_s) # Get ids of selected Additional Tenants in the Tenants tree

    if params[:currency]
      @edit[:new][:currency] = params[:currency].blank? ? nil : params[:currency].to_i
      @edit[:new][:code_currency] = @edit[:new][:currency] ? code_currency_label(params[:currency]) : _('Price / Month')
    end

    if params[:server_profile_template_id]
      @edit[:new][:server_profile_template_id] = params[:server_profile_template_id]
    end

    field_changed = params[:form_field_changed] ? true : false

    ENTRY_POINT_TYPES.each do |key, prefix|
      type_key = "#{prefix[:type]}_entry_point_type".to_sym
      automation_type_changed = false
      if params[type_key]
        automation_type_changed = (params[type_key] != @edit[:new][type_key])
        # Assigns the new entry_point type when the select box is changed.
        @edit[:new][type_key] = params[type_key]
      end

      workflows_edit_key = "#{prefix[:type]}_configuration_script_id".to_sym
      @edit[:new][workflows_edit_key] = params[workflows_edit_key] if params[workflows_edit_key]

      restore_previous_entry_point(key, type_key) if field_changed && automation_type_changed
    end

    get_form_vars_orchestration if @edit[:new][:st_prov_type] == 'generic_orchestration'
    fetch_form_vars_ansible_or_ct if %w[generic_ansible_tower generic_awx generic_container_template].include?(@edit[:new][:st_prov_type])
    fetch_form_vars_ovf_template if @edit[:new][:st_prov_type] == 'generic_ovf_template'
    fetch_form_vars_server_profile_templates if @edit[:new][:st_prov_type] == 'cisco_intersight'
  end

  # Method to display previously selected entry_point when automation_type is changed.
  def restore_previous_entry_point(key, type_key)
    current_entry_point = @edit[:new][key]
    previous_type = embedded_automate(params[type_key]) ? embedded_workflow_key : embedded_automate_key
    @edit[:new][key] = @edit[:new]["#{key}_previous".to_sym][params[type_key].to_sym]
    @edit[:new]["#{key}_previous".to_sym][previous_type.to_sym] = current_entry_point
  end

  def code_currency_label(currency)
    _('Price / Month (in %{currency})') % {:currency => Currency.find(currency).code}
  end

  def checked_tenants
    new_id = params[:id].split('-').pop.to_i if params[:id].starts_with?('tn')
    tenant = Tenant.find(new_id)
    new_ids = [new_id] + tenant.descendants.pluck(:id)
    tenant_ids = @edit[:new][:tenant_ids]
    if params[:check] == '1' # Adding/checking Tenant(s) in the tree for the Catalog Item
      tenant_ids += new_ids
    elsif params[:check] == '0' # Unchecking selected Tenant(s)
      new_ids += tenant.ancestors.pluck(:id)
      new_ids.each { |t| tenant_ids.delete(t) }
    end
    @edit[:new][:tenant_ids] = tenant_ids.sort.uniq
  end

  def available_container_managers
    @edit[:new][:available_managers] =
      ManageIQ::Providers::ContainerManager.all.collect { |t| [t.name, t.id] }.sort
    ct = ContainerTemplate.find_by(:id => @record.config_info[:provision][:container_template_id]) if @record.config_info[:provision] && @record.config_info[:provision][:container_template_id]
    @edit[:new][:template_id] = ct.try(:id)
    @edit[:new][:manager_id] = ct.try(:ext_management_system).try(:id)
    available_container_templates(@edit[:new][:manager_id]) if @edit[:new][:manager_id]
  end

  def get_form_vars_orchestration
    if params[:template_id]
      if params[:template_id] == ""
        @edit[:new][:available_managers] = []
        @edit[:new][:template_id]        = nil
        @edit[:new][:manager_id]         = nil
      else
        @edit[:new][:template_id] = params[:template_id]
        available_orchestration_managers(params[:template_id])
      end
    end
    @edit[:new][:manager_id] = params[:manager_id] if params[:manager_id]
  end

  def fetch_form_vars_ansible_or_ct
    if params[:manager_id]
      if params[:manager_id] == ""
        @edit[:new][:available_templates] = []
        @edit[:new][:template_id]         = nil
        @edit[:new][:manager_id]          = nil
      else
        @edit[:new][:manager_id] = params[:manager_id]
        available_job_templates(params[:manager_id]) if @edit[:new][:st_prov_type] == 'generic_ansible_tower' || @edit[:new][:st_prov_type] == 'generic_awx'
        available_container_templates(params[:manager_id]) if @edit[:new][:st_prov_type] == 'generic_container_template'
      end
    end
    @edit[:new][:template_id] = params[:template_id] if params[:template_id]
  end

  def available_orchestration_managers_for_template_type(template_type)
    template_type = template_type.to_s.safe_constantize
    return [] unless template_type && template_type < OrchestrationTemplate

    template_type.eligible_managers.collect { |m| [m.name, m.id] }.sort
  end

  def available_orchestration_managers(template_id)
    @edit[:new][:available_managers] = OrchestrationTemplate.find(template_id)
                                                            .eligible_managers
                                                            .collect { |m| [m.name, m.id] }
                                                            .sort
  end

  def available_orchestration_templates
    @edit[:new][:available_templates] = OrchestrationTemplate.available
                                                             .collect { |t| [t.name.to_s, t.id] }
                                                             .sort
    @edit[:new][:template_id] = @record.orchestration_template.try(:id)
    @edit[:new][:manager_id] = @record.orchestration_manager.try(:id)
    available_orchestration_managers(@record.orchestration_template.id) if @record.orchestration_template
  end

  def available_container_templates(manager_id)
    method = @edit[:new][:st_prov_type] == 'generic_ansible_tower' || @edit[:new][:st_prov_type] == 'generic_awx' ? 'configuration_scripts' : 'container_templates'
    @edit[:new][:available_templates] =
      ExtManagementSystem.find_by(:id => manager_id).send(method).collect { |t| [t.name, t.id] }.sort
  end

  def available_job_templates(manager_id)
    @edit[:new][:available_templates] = []
    all_job_templates, all_workflow_templates = fetch_all_templates(manager_id)
    @edit[:new][:available_templates].push(["",
                                            [["<#{_('Choose a Template')}>",
                                              :selected => "<#{_('Choose a Template')}>",
                                              :disabled => "<#{_('Choose a Template')}>",
                                              :style    => 'display:none']]])
    @edit[:new][:available_templates].push(["Job Templates", all_job_templates]) if all_job_templates.present?
    @edit[:new][:available_templates].push(["Workflow Templates", all_workflow_templates]) if all_workflow_templates.present?
  end

  def fetch_all_templates(manager_id)
    all_templates = ExtManagementSystem.find_by(:id => manager_id).configuration_scripts.sort_by(&:name)
    workflow_templates = all_templates.collect { |t| [t.name, t.id] if t.kind_of?(ManageIQ::Providers::AutomationManager::ConfigurationWorkflow) }.compact
    job_templates = all_templates.collect { |t| [t.name, t.id] if t.kind_of?(ManageIQ::Providers::AutomationManager::ConfigurationScript) }.compact - workflow_templates
    return job_templates, workflow_templates
  end

  def available_ansible_tower_managers
    @edit[:new][:available_managers] =
      ManageIQ::Providers::AutomationManager.all.collect { |t| [t.name, t.id] }.sort
    @edit[:new][:template_id] = @record.job_template.try(:id)
    @edit[:new][:manager_id] = @record.job_template.try(:manager).try(:id)
    available_job_templates(@edit[:new][:manager_id]) if @edit[:new][:manager_id]
  end

  def add_orchestration_template_vars(st)
    st.orchestration_template = @edit[:new][:template_id].nil? ? nil : OrchestrationTemplate.find(@edit[:new][:template_id])
    st.orchestration_manager  = @edit[:new][:manager_id].nil? ? nil : ExtManagementSystem.find(@edit[:new][:manager_id])
  end

  def add_ansible_tower_job_template_vars(st)
    st.job_template = @edit[:new][:template_id].nil? ? nil : ConfigurationScript.find(@edit[:new][:template_id])
  end

  def add_server_profile_template_vars(service_template)
    service_template.options[:server_profile_template_id] = @edit[:new][:server_profile_template_id].nil? ? nil : @edit[:new][:server_profile_template_id]
  end

  def add_container_template_vars
    st_options = {}
    st_options[:name] = @edit[:new][:name]
    st_options[:description] = @edit[:new][:description]
    st_options[:long_description] = @edit[:new][:display] ? @edit[:new][:long_description] : nil
    st_options[:provision_cost] = @edit[:new][:provision_cost]
    st_options[:display] = @edit[:new][:display]

    st_options[:service_template_catalog_id] = @edit[:new][:catalog_id].nil? ? nil : @edit[:new][:catalog_id]
    st_options[:config_info] = {
      :provision => {
        :container_template_id => @edit[:new][:template_id],
        :dialog_id             => @edit[:new][:dialog_id]
      }
    }
    provision = st_options[:config_info][:provision]
    provision[:fqname] = @edit[:new][:fqname] if @edit[:new][:fqname]
    provision[:reconfigure_fqname] = @edit[:new][:reconfigure_fqname] if @edit[:new][:reconfigure_fqname]
    provision[:retire_fqname] = @edit[:new][:retire_fqname] if @edit[:new][:retire_fqname]
    st_options
  end

  def st_get_form_vars
    get_form_vars
    if params[:resource_id]
      # adding new service resource, so need to lookup actual vm or service template record and set defaults
      sr = ServiceTemplate.find(params[:resource_id])
      # storing keys that are needed in ui in hash instead of storing an object
      r = {}
      r[:name] = sr.name
      r[:id] = sr.id
      r[:resource_id] = sr.id
      r[:start_action] = "Power On"
      r[:stop_action] = "Shutdown"
      r[:start_delay] = 0
      r[:stop_delay] = 0
      r[:scaling_min] = 1
      r[:scaling_max] = r[:scaling_min]
      r[:provision_index] = 0
      @edit[:new][:selected_resources].push(sr.id) unless @edit[:new][:selected_resources].include?(sr.id)
      @edit[:new][:rsc_groups][0] ||= [] # initialize array is adding new record

      # add another empty element to groups array if it doesn't exist to keep one extra in group pulldown
      @edit[:new][:rsc_groups].push([]) if @edit[:new][:selected_resources].length > 1 && !@edit[:new][:rsc_groups][@edit[:new][:rsc_groups].length - 1].empty?

      # push a new resource into highest existing/populated group
      @edit[:new][:rsc_groups].each_with_index do |g, i|
        next if g.present?

        id = i.zero? ? 0 : i - 1
        @edit[:new][:rsc_groups][id].push(r) unless @edit[:new][:rsc_groups][id].include?(r)
        break
      end
      @edit[:new][:provision_order] = recalculate_provision_order
    else
      # check if group idx change transaction came in
      params.each do |var, val|
        vars = var.split("_")
        if vars[0] == "gidx"
          rid = vars[1]
          # push a new resource into highest existing/populated group
          @group_changed = false
          @edit[:new][:rsc_groups].each_with_index do |groups, i|
            groups.each do |g|
              next unless g[:id].to_i == rid.to_i

              @edit[:new][:rsc_groups][val.to_i - 1].push(g)
              @edit[:new][:rsc_groups][i].delete(g)
              @group_changed = true
              break
            end
            break if @group_changed
          end

          rearrange_groups_array

          # setting flag to check whether to refresh screen
          @group_idx = true
        else
          param_name = [vars[0], vars[1]].join('_')
          keys = %w[provision_index scaling_max scaling_min start_action start_delay stop_action stop_delay]
          if keys.include?(param_name)
            @edit[:new][:rsc_groups].each_with_index do |groups, i|
              groups.sort_by { |gr| gr[:name].downcase }.each_with_index do |g, k|
                keys.each do |key|
                  param_key   = "#{key}_#{i}_#{k}".to_sym
                  param_value = params[param_key]
                  key         = key.to_sym

                  # convert start/stop delay into seconds, need to convert other values to_i
                  case key
                  when :start_delay, :stop_delay
                    g[key] = param_value.to_i * 60 if param_value
                  when :scaling_min
                    g[key] = param_value.to_i if param_value
                    # set flag to true so screen can be refreshed to adjust scaling_max pull down
                    g[:scaling_max] = g[:scaling_min] if g[:scaling_max] < g[:scaling_min]
                    @group_idx = true
                  when :scaling_max
                    g[key] = param_value.to_i if param_value
                  when :provision_index
                    if param_value
                      p_index = @edit[:new][:rsc_groups].flatten.collect { |rg| rg[:provision_index].to_i }.sort

                      # if index that came in is being used more than once
                      if p_index.count(g[key]) > 1
                        g[key] = param_value.to_i - 1
                      elsif p_index.count(g[key]) == 1
                        # if index being changed occur once
                        # rearrange all provision order values
                        rearrange_provision_order(@edit[:new][:rsc_groups], g[key])
                        g[key] = if param_value.to_i > p_index.last
                                   p_index.last
                                 else
                                   param_value.to_i - 1
                                 end
                      end
                      # recalculate values for pull-down
                      @edit[:new][:provision_order] = recalculate_provision_order
                    end
                  else
                    g[key] = param_value if param_value
                  end
                end
              end
            end
          end
        end
      end
    end

    # recalculate available resources, if resource id selected
    get_available_resources("ServiceTemplate") if params[:resource_id]
    @in_a_form = true
  end

  # building/rebuilding provision order pull down
  # add one extra number in pull down
  def recalculate_provision_order
    order = @edit[:new][:rsc_groups].flatten.collect { |r| r[:provision_index].to_i }.sort.uniq
    order.empty? ? order.push(1) : order.push(order.last + 1)
  end

  # rearrange provision order values so numbers aren't skipped
  def rearrange_provision_order(resources, current_index_value)
    resources.flatten.collect do |group|
      group[:provision_index] -= 1 if group[:provision_index] > current_index_value
    end
  end

  ROOT_NODE_MODELS = {
    :svccat_tree => "Service",                # TreeBuilderServiceCatalog "Service Catalogs"
    :sandt_tree  => "ServiceTemplate",        # TreeBuilderCatalogItems   "Catalog Items"
    :ot_tree     => "OrchestrationTemplate",  # TreeBuilderOrchestrationTemplates "Orch. Templates"
    :stcat_tree  => "ServiceTemplateCatalog", # TreeBuilderCatalogs       "Catalogs"
  }.freeze

  def root_node_model(tree)
    ROOT_NODE_MODELS[tree]
  end

  def root_node_right_cell_text(tree)
    case tree
    when :svccat_tree
      _('All Services')
    when :sandt_tree
      _('All Catalog Items')
    when :ot_tree
      _('All Orchestration Templates')
    when :stcat_tree
      _('All Catalogs')
    end
  end

  def get_node_info_handle_root_node
    if x_active_tree == :svccat_tree
      service_template_list(%i[displayed with_existent_service_template_catalog_id public_service_templates], :no_checkboxes => true)
    else
      process_show_list(get_show_list_options(root_node_model(x_active_tree)))
    end
    @right_cell_text = root_node_right_cell_text(x_active_tree)
  end

  def get_show_list_options(typ)
    options = {:model => typ&.constantize}
    if x_active_tree == :sandt_tree
      options[:named_scope] = :public_service_templates
    elsif x_active_tree == :ot_tree
      options[:named_scope] = :orderable
    end
    options
  end

  def get_node_info_handle_ot_folder_nodes
    typ = node_name_to_template_name(x_node)
    @right_cell_text = _("All %{models}") % {:models => ui_lookup(:models => typ)}
    options = {:model       => typ.constantize,
               :gtl_dbname  => :orchestrationtemplate,
               :named_scope => :orderable}
    process_show_list(options)
  end

  def get_node_info_handle_simple_leaf_node(id)
    show_record(id)
    @right_cell_text = _("%{model} \"%{name}\"") % {:name => @record.name, :model => ui_lookup(:model => TreeBuilder.get_model_for_prefix(@nodetype))}
  end

  def get_node_info_handle_unassigned_node
    scope = [:public_service_templates, [:without_service_template_catalog_id]]
    service_template_list(scope, :no_order_button => true)
    @right_cell_text = _("Services in Catalog \"Unassigned\"")
  end

  def get_node_info_handle_stc_node(id)
    scope = if x_active_tree == :sandt_tree
              # catalog items accordion also shows the non-"Display in Catalog" items
              [:public_service_templates, [:with_service_template_catalog_id, id]]
            else
              [:displayed, [:with_service_template_catalog_id, id]]
            end
    service_template_list(scope, :no_order_button => true)
    stc = ServiceTemplateCatalog.find(id)
    @right_cell_text = _("Services in Catalog \"%{name}\"") % {:name => stc.name}
  end

  def get_node_info_handle_leaf_node_stcat(id)
    @record = ServiceTemplateCatalog.find(id)
    @record_service_templates = Rbac.filtered(@record.service_templates, :named_scope => :public_service_templates)
    typ = TreeBuilder.get_model_for_prefix(@nodetype)
    @right_cell_text = _("%{model} \"%{name}\"") % {:name => @record.name, :model => ui_lookup(:model => typ)}
  end

  def get_node_info_handle_leaf_node_ot(id)
    @record = OrchestrationTemplate.find(id)
    @right_cell_text = _("%{model} \"%{name}\"") % {:name  => @record.name,
                                                    :model => ui_lookup(:model => @record.class.name)}
  end

  def get_node_info_handle_leaf_node(id)
    show_record(id)
    if @record.atomic? && need_prov_dialogs?(@record.prov_type)
      @miq_request = MiqRequest.find_by(:id => @record.service_resources[0].resource_id) if @record.service_resources[0]&.resource_id
      if @miq_request
        prov_set_show_vars
      else
        @options   = nil
        @no_wf_msg = _("Request is missing for selected item")
      end
    end
    unless @record.prov_type == "generic_ansible_playbook" || @record.prov_type == "generic_terraform_template"
      @sb[:dialog_label]       = _("No Dialog")
      @sb[:fqname]             = nil
      @sb[:reconfigure_fqname] = nil
      @sb[:retire_fqname]      = nil
      @record.resource_actions.each do |ra|
        d = Dialog.where(:id => ra.dialog_id).first

        # To display the automation_type and its entry point values in summary page.
        entry_point = resource_action_entry_point(ra)

        @sb[:dialog_label] = d.label if d
        case ra.action.downcase
        when 'provision'
          @sb[:fqname] = entry_point[:name]
          @sb[:provision_entry_point_type] = entry_point[:type]
          @sb[:provision_configuration_script_id] = entry_point[:configuration_script_id]
        when 'reconfigure'
          @sb[:reconfigure_fqname] = entry_point[:name]
          @sb[:reconfigure_entry_point_type] = entry_point[:type]
          @sb[:reconfigure_configuration_script_id] = entry_point[:configuration_script_id]
        when 'retirement'
          @sb[:retire_fqname] = entry_point[:name]
          @sb[:retire_entry_point_type] = entry_point[:type]
          @sb[:retire_configuration_script_id] = entry_point[:configuration_script_id]
        end
      end
      # saving values of ServiceTemplate catalog id and resource that are needed in view to build the link
      @sb[:stc_nodes] = {}
      @record.service_resources.each do |r|
        st = ServiceTemplate.find_by(:id => r.resource_id)
        @sb[:stc_nodes][r.resource_id] = st.service_template_catalog_id || "Unassigned" unless st.nil?
      end
    end
    if params[:action] == "x_show"
      prefix = @record.service_template_catalog_id ? "stc-#{@record.service_template_catalog_id}" : "-Unassigned"
      self.x_node = "#{prefix}_#{params[:id]}"
    end
    typ = x_active_tree == :svccat_tree ? "Service" : TreeBuilder.get_model_for_prefix(@nodetype)
    @right_cell_text = _("%{model} \"%{name}\"") % {:name => @record.name, :model => ui_lookup(:model => typ)}
  end

  # Get all info for the node about to be displayed
  def get_node_info(treenodeid, _show_list = true)
    @explorer ||= true
    @nodetype, id = parse_nodetype_and_id(valid_active_node(treenodeid))
    # saving this so it can be used while adding buttons/groups in buttons editor
    @sb[:applies_to_id] = id
    if %w[cb cbg].include?(@nodetype)
      # buttons folder or nodes under that were clicked
      build_resolve_screen
      buttons_get_node_info(treenodeid)
    else
      @sb[:buttons_node] = false
      if %w[Vm MiqTemplate ServiceResource].include?(TreeBuilder.get_model_for_prefix(@nodetype))
        get_node_info_handle_simple_leaf_node(id)
      elsif x_node == "root"
        get_node_info_handle_root_node
      elsif %w[xx-otcfn xx-othot xx-otazu xx-otazs xx-otvnf xx-otvap xx-otovf].include?(x_node)
        get_node_info_handle_ot_folder_nodes
      elsif x_active_tree == :stcat_tree
        get_node_info_handle_leaf_node_stcat(id)
      elsif x_active_tree == :ot_tree
        get_node_info_handle_leaf_node_ot(id)
      elsif id == "Unassigned"
        get_node_info_handle_unassigned_node
      elsif @nodetype == "stc"
        get_node_info_handle_stc_node(id)
      else
        get_node_info_handle_leaf_node(id)
      end
    end
    {:view => @view, :pages => @pages}
  end

  def fetch_ct_details
    ct_details = {}
    provision = @record.config_info[:provision]
    ct_details[:provisioning] = {}
    ct = ContainerTemplate.find_by(:id => provision[:container_template_id])
    ct_details[:provisioning][:template_name] = ct.try(:name)
    ct_details[:provisioning][:provider_name] = ct.try(:ext_management_system).try(:name)
    ct_details
  end

  def content_library_type?
    prov_type = if params[:st_prov_type]
                  params[:st_prov_type]
                elsif @record
                  @record.prov_type
                elsif @edit
                  @edit[:new][:st_prov_type]
                end
    prov_type == 'generic_ovf_template'
  end

  def content_library?
    content_library = content_library_type?
    @current_region = MiqRegion.my_region.region if content_library
    content_library
  end
  helper_method :content_library?

  def fetch_ovf_template_details
    ovf_template_details = {}
    ovf_template_details[:provisioning] = {}
    provision = @record.config_info[:provision]

    rp = ResourcePool.find_by(:id => provision[:resource_pool_id])
    ovf_template_details[:provisioning][:resource_pool_name] = rp.try(:name)

    dc = Datacenter.find_by(:id => provision[:datacenter_id])
    ovf_template_details[:provisioning][:datacenter_name] = dc.try(:name)

    host = Host.find_by(:id => provision[:host_id])
    ovf_template_details[:provisioning][:host_name] = host.try(:name)

    storage = Storage.find_by(:id => provision[:storage_id])
    ovf_template_details[:provisioning][:storage_name] = storage.try(:name)

    network = Lan.find_by(:id => provision[:network_id])
    ovf_template_details[:provisioning][:network_name] = network.try(:name)

    ovf_template_details[:provisioning][:disk_format] = provision[:disk_format]

    folder =
      if dc
        dc.folders.find { |f| f.name == 'vm' }.try(:ems_ref)
      else
        EmsFolder.find_by(:id => provision[:ems_folder_id]).try(:name)
      end
    ovf_template_details[:provisioning][:ems_folder_name] = folder if folder

    ovf_template = ManageIQ::Providers::Vmware::InfraManager::OrchestrationTemplate.find_by(:id => provision[:ovf_template_id])
    ovf_template_details[:provisioning][:ovf_template_name] = ovf_template.try(:name)

    ovf_template_details
  end

  def fetch_form_vars_ovf_template
    @edit[:new][:accept_all_eula] = params[:accept_all_eula] == "1" if params[:accept_all_eula]
    copy_params_if_present(@edit[:new], params, %i[datacenter_id disk_format ems_folder_id host_id network_id ovf_template_id resource_pool_id storage_id vm_name])
    form_available_vars_ovf_template if params[:st_prov_type] || params[:ovf_template_id]
  end

  def form_available_vars_ovf_template
    @edit[:available_ovf_templates] = ManageIQ::Providers::Vmware::InfraManager::OrchestrationTemplate.all
                                                                                                      .collect { |m| [m.name, m.id] }
                                                                                                      .sort
    @edit[:disk_formats] = {
      "thick"            => _("thick - Lazy Zero"),
      "eagerZeroedThick" => _("thick - Eager Zero"),
      "thin"             => _("thin")
    }

    # set from existing record
    if @record.try(:id) && params[:button] != "save"
      options = @record.config_info[:provision]
      @edit[:new][:ovf_template_id] ||= options[:ovf_template_id]
      @edit[:new][:datacenter_id] ||= options[:datacenter_id]
      @edit[:new][:vm_name] ||= options[:vm_name]
      @edit[:new][:resource_pool_id] ||= options[:resource_pool_id]
      @edit[:new][:ems_folder_id] ||= options[:ems_folder_id]
      @edit[:new][:host_id] ||= options[:host_id]
      @edit[:new][:storage_id] ||= options[:storage_id]
      @edit[:new][:disk_format] ||= options[:disk_format]
      @edit[:new][:network_id] ||= options[:network_id]
      @edit[:new][:accept_all_eula] ||= options[:accept_all_eula] == true
      @edit[:new][:fqname] ||= options[:fqname]
    end

    if @edit[:new][:ovf_template_id]
      ovf_template = ManageIQ::Providers::Vmware::InfraManager::OrchestrationTemplate.find_by(:id => @edit[:new][:ovf_template_id])
      @edit[:available_datacenters] = ovf_template.allowed_datacenters
                                                  .collect { |m| [m.last, m.first] }
                                                  .sort
      @edit[:available_resource_pools] = ovf_template.allowed_resource_pools
                                                     .collect { |m| [m.last, m.first] }
                                                     .sort
      @edit[:available_folders] = ovf_template.allowed_folders
                                              .collect { |m| [m.last, m.first] }
                                              .sort
      @edit[:available_hosts] = ovf_template.allowed_hosts
                                            .collect { |h| [h.name, h.id] }
                                            .sort
      @edit[:available_storages] = ovf_template.allowed_storages
                                               .collect { |s| [s.name, s.id] }
                                               .sort
      @edit[:available_vlans] = ovf_template.allowed_vlans
                                            .collect { |v| [v.last, v.first] }
                                            .sort
    else
      @edit[:available_resource_pools] = []
      @edit[:available_datacenters]    = []
      @edit[:available_folders]        = []
      @edit[:available_hosts]          = []
      @edit[:available_storages]       = []
      @edit[:available_vlans]          = []
      @edit[:new][:resource_pool_id]   = nil
      @edit[:new][:datacenter_id]      = nil
      @edit[:new][:host_id]            = nil
      @edit[:new][:storage_id]         = nil
      @edit[:new][:disk_format]        = nil
      @edit[:new][:network_id]         = nil
      @edit[:new][:ems_folder_id]      = nil
    end
  end

  def set_record_vars_ovf_template
    options = {}
    options[:name] = @edit[:new][:name]
    options[:description] = @edit[:new][:description]
    options[:long_description] = @edit[:new][:display] ? @edit[:new][:long_description] : nil
    options[:provision_cost] = @edit[:new][:provision_cost]
    options[:display] = @edit[:new][:display]
    options[:zone_id] = @edit[:new][:zone_id] if @edit[:new][:zone_id]
    options[:additional_tenants] = Tenant.where(:id => @edit[:new][:tenant_ids]) if @edit[:new][:tenant_ids]
    options[:service_template_catalog_id] = @edit[:new][:catalog_id].nil? ? nil : @edit[:new][:catalog_id]
    provision = {}
    provision[:ovf_template_id] = @edit[:new][:ovf_template_id] if @edit[:new][:ovf_template_id]
    provision[:datacenter_id] = @edit[:new][:datacenter_id] if @edit[:new][:datacenter_id]
    provision[:vm_name] = @edit[:new][:vm_name] if @edit[:new][:vm_name]
    provision[:resource_pool_id] = @edit[:new][:resource_pool_id] if @edit[:new][:resource_pool_id]
    provision[:ems_folder_id] = @edit[:new][:ems_folder_id] if @edit[:new][:ems_folder_id]
    provision[:host_id] = @edit[:new][:host_id] if @edit[:new][:host_id]
    provision[:storage_id] = @edit[:new][:storage_id] if @edit[:new][:storage_id]
    provision[:disk_format] = @edit[:new][:disk_format] if @edit[:new][:disk_format]
    provision[:network_id] = @edit[:new][:network_id] if @edit[:new][:network_id]
    provision[:accept_all_eula] = @edit[:new][:accept_all_eula] if @edit[:new][:accept_all_eula]
    provision[:fqname] = @edit[:new][:fqname] if @edit[:new][:fqname]
    options[:config_info] = {:provision => provision}
    options
  end

  def need_ovf_template_locals?
    x_active_tree == :sandt_tree &&
      TreeBuilder.get_model_for_prefix(@nodetype) == "ServiceTemplate" &&
      @record.prov_type == "generic_ovf_template"
  end

  def validate_vm_name
    ems_id = ManageIQ::Providers::Vmware::InfraManager::OrchestrationTemplate.find_by(:id => @edit[:new][:ovf_template_id]).ems_id
    add_flash(_("VM Name already exists, Please select a different VM Name"), :error) if VmOrTemplate.find_by(:name => @edit[:new][:vm_name], :ems_id => ems_id).present?
  end

  def fetch_form_vars_server_profile_templates
    form_available_server_profile_templates if params[:st_prov_type]
  end

  def form_available_server_profile_templates
    @edit[:available_server_profile_templates] = PhysicalServerProfileTemplate.all.collect { |m| [m.name, m.id] }.sort
  end

  def automate_tree_needed?
    options = %i[display template_id manager_id ovf_template_id datacenter_id resource_pool_id ems_folder_id host_id storage_id]
    options.any? { |x| params[x] }
  end
  helper_method :automate_tree_needed?

  def fetch_playbook_details
    playbook_details = {}
    provision = @record.config_info[:provision]
    provisioning_details = {}
    provisioning_details[:repository] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource, provision[:repository_id])
    provisioning_details[:playbook] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook, provision[:playbook_id])
    provisioning_details[:machine_credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::MachineCredential, provision[:credential_id])
    provisioning_details[:network_credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::NetworkCredential, provision[:network_credential_id]) if provision[:network_credential_id]
    provisioning_details[:cloud_credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::CloudCredential, provision[:cloud_credential_id]) if provision[:cloud_credential_id]
    provisioning_details[:vault_credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::VaultCredential, provision[:vault_credential_id]) if provision[:vault_credential_id]
    provisioning_details[:execution_ttl] = provision[:execution_ttl]
    provisioning_details[:verbosity] = provision[:verbosity]
    provisioning_details[:log_output] = provision[:log_output]
    provisioning_details[:become_enabled] = provision[:become_enabled] == true ? _('Yes') : _('No')
    playbook_details[:provisioning] = provisioning_details
    fetch_dialog(playbook_details, provision[:dialog_id], :provisioning)

    if @record.config_info[:retirement]
      retirement = @record.config_info[:retirement]
      retirement_details = {}
      retirement_details[:remove_resources] = retirement[:remove_resources]
      if retirement[:repository_id]
        retirement_details[:repository] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource, retirement[:repository_id])
        retirement_details[:playbook] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook, retirement[:playbook_id])
        retirement_details[:machine_credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::MachineCredential, retirement[:credential_id])
        retirement_details[:network_credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::NetworkCredential, retirement[:network_credential_id]) if retirement[:network_credential_id]
        retirement_details[:cloud_credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::CloudCredential, retirement[:cloud_credential_id]) if retirement[:cloud_credential_id]
        retirement_details[:vault_credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::VaultCredential, retirement[:vault_credential_id]) if retirement[:vault_credential_id]
      end
      retirement_details[:execution_ttl] = retirement[:execution_ttl]
      retirement_details[:verbosity] = retirement[:verbosity]
      retirement_details[:log_output] = retirement[:log_output]
      retirement_details[:become_enabled] = retirement[:become_enabled] == true ? _('Yes') : _('No')
      playbook_details[:retirement] = retirement_details
    end
    playbook_details
  end

  def fetch_terraform_template_details
    terraform_template_details = {}
    provision = @record.config_info[:provision]
    provisioning_details = {}
    provisioning_details[:repository] = fetch_name_from_object(ManageIQ::Providers::EmbeddedTerraform::AutomationManager::ConfigurationScriptSource, provision[:repository_id])
    provisioning_details[:template] = fetch_name_from_object(ManageIQ::Providers::EmbeddedTerraform::AutomationManager::ConfigurationScriptPayload, provision[:configuration_script_payload_id])
    provisioning_details[:credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedTerraform::AutomationManager::Credential, provision[:credential_id])
    provisioning_details[:network_credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedTerraform::AutomationManager::NetworkCredential, provision[:network_credential_id]) if provision[:network_credential_id]
    provisioning_details[:execution_ttl] = provision[:execution_ttl]
    provisioning_details[:verbosity] = provision[:verbosity]
    provisioning_details[:log_output] = provision[:log_output]
    provisioning_details[:become_enabled] = provision[:become_enabled] == true ? _('Yes') : _('No')
    terraform_template_details[:provisioning] = provisioning_details
    fetch_dialog(terraform_template_details, provision[:dialog_id], :provisioning)

    # NOTE: This code is commented out since the retirement tab is not needed yet
    # if @record.config_info[:retirement]
    #   retirement = @record.config_info[:retirement]
    #   terraform_template_details[:retirement] = {}
    #   terraform_template_details[:retirement][:remove_resources] = retirement[:remove_resources]
    #   if retirement[:repository_id]
    #     terraform_template_details[:retirement][:repository] = fetch_name_from_object(ManageIQ::Providers::EmbeddedTerraform::AutomationManager::ConfigurationScriptSource, retirement[:repository_id])
    #     terraform_template_details[:retirement][:template] = fetch_name_from_object(ManageIQ::Providers::EmbeddedTerraform::AutomationManager::ConfigurationScriptPayload, retirement[:configuration_script_payload_id])
    #     terraform_template_details[:retirement][:credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedTerraform::AutomationManager::Credential, retirement[:credential_id])
    #     terraform_template_details[:retirement][:network_credential] = fetch_name_from_object(ManageIQ::Providers::EmbeddedTerraform::AutomationManager::NetworkCredential, retirement[:network_credential_id]) if retirement[:network_credential_id]
    #   end
    #   terraform_template_details[:retirement][:execution_ttl] = retirement[:execution_ttl]
    #   terraform_template_details[:retirement][:verbosity] = retirement[:verbosity]
    #   terraform_template_details[:retirement][:log_output] = retirement[:log_output]
    #   terraform_template_details[:retirement][:become_enabled] = retirement[:become_enabled] == true ? _('Yes') : _('No')
    # end
    terraform_template_details
  end

  def fetch_dialog(playbook_details, dialog_id, key)
    return nil if dialog_id.nil?

    dialog = Dialog.find_by(:id => dialog_id)
    return nil if dialog.nil?

    playbook_details[key][:dialog] = dialog.name
    playbook_details[key][:dialog_id] = dialog.id
  end

  def open_parent_nodes(record)
    existing_node = nil # Init var

    if record.kind_of?(OrchestrationTemplate)
      parents = [:id => template_to_node_name(record)]
    else
      # Check for parent nodes missing from vandt tree and return them if any
      parent_rec = ServiceTemplateCatalog.find_by(:id => record.service_template_catalog_id) # nil is a valid value
      parents = if parent_rec.nil?
                  [parent_rec, :id => "-Unassigned"]
                else
                  [parent_rec, :id => "stc-#{record.service_template_catalog_id}"]
                end
    end
    # Go up thru the parents and find the highest level unopened, mark all as opened along the way
    unless parents.empty? || # Skip if no parents or parent already open
           x_tree[:open_nodes].include?(parents.last[:id])
      parents.reverse_each do |p|
        next if p.nil?

        p_node = x_build_node_id(p)
        unless x_tree[:open_nodes].include?(p_node)
          x_tree[:open_nodes].push(p_node)
          existing_node = p_node
        end
      end
    end
    add_nodes = {:key => existing_node, :nodes => tree_add_child_nodes(existing_node)} if existing_node
    self.x_node = if params[:rec_id]
                    "stc-#{record.service_template_catalog_id}_st-#{record.id}"
                  elsif record.kind_of?(OrchestrationTemplate)
                    "xx-#{parents.last[:id]}_ot-#{record.id}"
                  else
                    "#{parents.last[:id]}_#{params[:id]}"
                  end
    add_nodes
  end

  # Replace the right cell of the explorer
  def replace_right_cell(options = {})
    action, replace_trees, presenter = options.values_at(:action, :replace_trees, :presenter)
    @explorer = true

    # FIXME: make this functional
    get_node_info(x_node) unless @tagging || @edit || @in_a_form
    replace_trees   = @replace_trees   if @replace_trees    # get_node_info might set this
    right_cell_text = @right_cell_text if @right_cell_text  # get_node_info might set this too

    trees = build_replaced_trees(replace_trees, %i[sandt svccat stcat ot])

    type, _id = parse_nodetype_and_id(x_node)

    allowed_records = %w[MiqTemplate OrchestrationTemplate Service ServiceTemplate ServiceTemplateCatalog]
    record_showing = (type && allowed_records.include?(TreeBuilder.get_model_for_prefix(type)) && @record.present?) || params[:action] == "x_show"
    # Clicked on right cell record, open the tree enough to show the node, if not already showing
    if params[:action] == "x_show" && x_active_tree != :stcat_tree &&
       @record && # Showing a record
       !@in_a_form # Not in a form
      add_nodes = open_parent_nodes(@record) # Open the parent nodes of selected record, if not open
    end

    v_tb =
      case x_active_tree
      when :sandt_tree
        if record_showing && !@in_a_form
          if TreeBuilder.get_model_for_prefix(@nodetype) == "MiqTemplate"
            build_toolbar("summary_view_tb")
          end
        elsif !%w[xx csb cbg cb].include?(@nodetype) && !@in_a_form
          build_toolbar("download_view_tb")
        end
      when :svccat_tree, :stcat_tree, :ot_tree
        build_toolbar("download_view_tb") unless record_showing || @in_a_form
      end

    c_tb = build_toolbar(center_toolbar_filename) unless x_active_tree == :svccat_tree && @in_a_form

    presenter ||= ExplorerPresenter.right_cell(
      :active_tree => x_active_tree,
      :add_nodes   => add_nodes
    )
    reload_trees_by_presenter(presenter, trees)

    if @sb[:buttons_node]
      if action == "group_reorder"
        right_cell_text = _("Button Group Reorder")
      end
    end
    presenter[:right_cell_text] = right_cell_text

    # Replace right cell divs
    content = if @tagging
                action_url = x_active_tree == :ot_tree ? "ot_tags_edit" : "st_tags_edit"
                r[:partial => "layouts/x_tagging", :locals => {:action_url => action_url}]
              elsif action && %w[at_st_new st_new].include?(action) && terraform_template_type?
                r[:partial => "tt_react_form"]
              elsif action && %w[at_st_new st_new].include?(action)
                r[:partial => ansible_playbook_type? ? "st_angular_form" : "st_form"]
              elsif action && %w[ownership].include?(action)
                r[:partial => @refresh_partial]
              elsif action && %w[st_catalog_new st_catalog_edit].include?(action)
                r[:partial => "stcat_form"]
              elsif action == "dialog_provision"
                r[:partial => "shared/dialogs/dialog_provision", :locals => options[:dialog_locals]]
              elsif %w[ot_add ot_copy ot_edit service_dialog_from_ot copy_catalog].include?(action)
                r[:partial => action]
              elsif record_showing
                if TreeBuilder.get_model_for_prefix(@nodetype) == "MiqTemplate"
                  r[:partial => "layouts/textual_groups_generic"]
                elsif @sb[:buttons_node]
                  r[:partial => "shared/buttons/ab_list"]
                else
                  template_locals = {:controller => "catalog"}
                  template_locals.merge!(fetch_playbook_details) if need_ansible_locals?
                  template_locals.merge!(fetch_terraform_template_details) if need_terraform_locals?
                  template_locals.merge!(fetch_ct_details) if need_container_template_locals?
                  template_locals.merge!(fetch_ovf_template_details) if need_ovf_template_locals?
                  r[:partial => "catalog/#{x_active_tree}_show", :locals => template_locals]
                end
              elsif @sb[:buttons_node]
                r[:partial => "shared/buttons/ab_list"]
              else
                r[:partial => "layouts/x_gtl"]
              end
    presenter.update(:main_div, content)

    # have to make Catalog Items accordion active incase link on Catalog show screen was pressed

    # Decide whether to show paging controls
    if @tagging
      presenter.hide(:toolbar).show(:paging_div)
      presenter.show(:form_buttons_div).remove_paging
    elsif record_showing || @in_a_form || @sb[:buttons_node] ||
          (@pages && (@items_per_page == ONE_MILLION || @pages[:items] == 0))
      if %w[button_edit group_edit group_reorder at_st_new st_new st_catalog_new st_catalog_edit copy_catalog].include?(action)
        presenter.hide(:toolbar).show(:paging_div)
        # incase it was hidden for summary screen, and incase there were no records on show_list
        presenter.remove_paging
        if (action == 'at_st_new' && (ansible_playbook_type? || terraform_template_type?)) || %w[st_catalog_new st_catalog_edit copy_catalog].include?(action)
          presenter.hide(:form_buttons_div)
        else
          presenter.show(:form_buttons_div)
        end
        locals = {:record_id => @edit[:rec_id]}
        case action
        when 'group_edit'
          locals[:action_url] = @edit[:rec_id] ? 'group_update' : 'group_create'
        when 'group_reorder'
          locals[:action_url]   = 'ab_group_reorder'
          locals[:multi_record] = true
        when 'button_edit'
          locals[:action_url] = @edit[:rec_id] ? 'button_update' : 'button_create'
        when 'st_catalog_new', 'st_catalog_edit'
          locals[:action_url] = 'st_catalog_edit'
        else
          locals[:action_url] = 'servicetemplate_edit'
          locals[:serialize] = true
        end
        presenter.update(:form_buttons_div, r[:partial => "layouts/x_edit_buttons", :locals => locals]) if allow_presenter_update(action)
      elsif action == "dialog_provision"
        presenter.hide(:toolbar)
        # incase it was hidden for summary screen, and incase there were no records on show_list
        presenter.hide(:form_buttons_div, :paging_div).remove_paging
      else
        # Added so buttons can be turned off even tho div is not being displayed it still pops up Abandon changes box when trying to change a node on tree after saving a record
        presenter.hide(:buttons_on, :form_buttons_div).show(:toolbar).hide(:paging_div)
      end
    else
      presenter.hide(:form_buttons_div).show(:toolbar, :paging_div)
    end

    # hide form buttons and toolbar for react forms actions
    if %w[ot_add ot_edit ot_copy service_dialog_from_ot].include?(action)
      presenter.hide(:toolbar, :paging_div, :form_buttons_div)
    else
      presenter.set_visibility(c_tb.present? || v_tb.present?, :toolbar)
    end
    presenter.reload_toolbars(:center => c_tb, :view => v_tb)

    presenter[:record_id] = determine_record_id_for_presenter
    presenter[:lock_sidebar] = @edit && @edit[:current] || action == 'copy_catalog'
    presenter[:osf_node] = x_node
    presenter.reset_one_trans

    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    render :json => presenter.for_render
  end

  # This method disables the action buttons of the old button-group form page.
  def allow_presenter_update(action)
    restricted_actions = ['group_edit']
    action ? restricted_actions.exclude?(action.to_s) : false
  end

  def need_ansible_locals?
    x_active_tree == :sandt_tree &&
      TreeBuilder.get_model_for_prefix(@nodetype) == "ServiceTemplate" &&
      @record.prov_type == "generic_ansible_playbook"
  end

  def need_terraform_locals?
    x_active_tree == :sandt_tree &&
      TreeBuilder.get_model_for_prefix(@nodetype) == "ServiceTemplate" &&
      @record.prov_type == "generic_terraform_template"
  end

  def need_container_template_locals?
    x_active_tree == :sandt_tree &&
      TreeBuilder.get_model_for_prefix(@nodetype) == "ServiceTemplate" &&
      @record.prov_type == "generic_container_template"
  end

  def show_record(id = nil)
    @sb[:action] = nil
    @display = params[:display] || "main" unless pagination_or_gtl_request?

    @lastaction = "show"
    @showtype = "config"
    identify_catalog(id)

    return if record_no_longer_exists?(@record)
  end

  def get_session_data
    @title      = _("Catalog Items")
    @layout     = "catalogs"
    @lastaction = session[:svc_lastaction]
    @options    = session[:prov_options]
    @resolve    = session[:resolve] if session[:resolve]
  end

  def set_session_data
    session[:svc_lastaction] = @lastaction
    session[:prov_options]   = @options if @options
    session[:resolve]        = @resolve if @resolve
  end

  def dialog_catalog_check
    return unless @edit[:new][:display] && (@edit[:new][:dialog_id].nil? || @edit[:new][:dialog_id].to_i.zero?)

    add_flash(_("Dialog has to be set if Display in Catalog is chosen"), :error)
  end

  def validate_price
    if @edit[:new][:currency] && @edit[:new][:price].blank?
      add_flash(_("Price / Month is required"), :error)
    end
    add_flash(_("Price must be a numeric value"), :error) if @edit[:new][:price].present? && !float_value?(@edit[:new][:price])
  end

  def float_value?(value)
    value.to_s =~ /(^(\d+)(\.)?(\d+)?)|(^(\d+)?(\.)(\d+))/
  end

  def x_edit_tags_reset(db)
    @tagging = session[:tag_db] = db
    checked_ids = find_checked_items.empty? ? [params[:id]] : find_checked_items
    @object_ids = find_records_with_rbac(db.safe_constantize, checked_ids).ids
    if params[:button] == 'reset'
      id = params[:id] if params[:id]
      return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}", 'replace_cell__explorer')

      @object_ids = @edit[:object_ids]
      session[:tag_db] = @tagging = @edit[:tagging]
    else
      @object_ids[0] = params[:id] if @object_ids.blank? && params[:id]
      session[:tag_db] = @tagging = params[:tagging] if params[:tagging]
    end

    session[:assigned_filters] = assigned_filters
    x_tags_set_form_vars
    @in_a_form = true
    session[:changed] = false
    add_flash(_('All changes have been reset'), :warning) if params[:button] == "reset"
    @right_cell_text = _("Editing %{model} Tags for \"%{name}\"") % {:name  => ui_lookup(:models => @tagging),
                                                                     :model => current_tenant.name}

    replace_right_cell(:action => @sb[:action])
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Services")},
        {:title => _("Catalogs")},
      ],
    }
  end

  menu_section :svc
  feature_for_actions %w[ab_button_new ab_button_edit ab_group_new ab_group_edit], *EXP_EDITOR_ACTIONS
end
