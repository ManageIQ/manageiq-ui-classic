class StorageController < ApplicationController
  include_concern 'StorageD'
  include_concern 'StoragePod'
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::MoreShowActions
  include Mixins::ExplorerPresenterMixin
  include Mixins::FindRecord
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.display_methods
    %w[all_vms hosts all_miq_templates registered_vms unregistered_vms custom_button_events]
  end

  def self.custom_display_method
    %w[all_miq_templates]
  end

  def display_all_miq_templates
    nested_list(MiqTemplate, :parent => @record, :association => "all_miq_templates")
  end

  def display_registered_vms
    nested_list(Vm, :parent_method => "registered_vms", :breadcrumb_title => _('Managed/Registered VMs'))
  end

  def display_unregistered_vms
    nested_list(Vm, :parent_method => "unregistered_vms", :breadcrumb_title => _('Managed/Unregistered VMs'))
  end

  def show_list
    flash_to_session
    redirect_to(:action => 'explorer')
  end

  def init_show
    return unless super
    if !@explorer && @display == "main"
      tree_node_id = TreeBuilder.build_node_id(@record)
      session[:exp_parms] = {:display => @display, :refresh => params[:refresh], :id => tree_node_id}

      # redirect user back to where they came from if they dont have access to any of vm explorers
      # or redirect them to the one they have access to
      redirect_controller = role_allows?(:feature => "storage_show") ? "storage" : nil

      if redirect_controller
        action = "explorer"
      else
        url = request.env['HTTP_REFERER'].split('/')
        flash_to_session(_("User '%{username}' is not authorized to access '%{controller_name}'") %
                    {:username => current_userid, :controller_name => ui_lookup(:table => controller_name)}, :warning)
        redirect_controller  = url[3]
        action               = url[4]
      end

      redirect_to(:controller => redirect_controller,
                  :action     => action)
      return
    end

    @gtl_url = "/show"
    true
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w[all_vms vms hosts].include?(@display) # Were we displaying vms or hosts

    if params[:pressed].starts_with?("vm_", # Handle buttons from sub-items screen
                                     "miq_template_",
                                     "guest_",
                                     "host_")

      case params[:pressed]
      when 'host_analyze_check_compliance'
        analyze_check_compliance_hosts
      when 'host_check_compliance'
        check_compliance_hosts
      when 'host_compare'
        comparemiq
      when 'host_delete'
        deletehosts
      when 'host_edit'
        edit_record
      when 'host_protect'
        assign_policies(Host)
      when 'host_refresh'
        refreshhosts
      when 'host_scan'
        scanhosts
      when 'host_tag'
        tag(Host)
      end

      pfx = pfx_for_vm_button_pressed(params[:pressed])
      # Handle Host power buttons
      if host_power_button?(params[:pressed])
        handle_host_power_button(params[:pressed])
      else
        process_vm_buttons(pfx)
        return if ["host_tag", "#{pfx}_policy_sim", "host_scan", "host_refresh", "host_protect",
                   'host_compare', "#{pfx}_compare", "#{pfx}_tag", "#{pfx}_protect", "#{pfx}_retire",
                   "#{pfx}_ownership", "#{pfx}_right_size", "#{pfx}_reconfigure"].include?(params[:pressed]) &&
                  @flash_array.nil? # Tag screen is showing, so return

        unless ["host_edit", "#{pfx}_edit", "#{pfx}_miq_request_new", "#{pfx}_clone", "#{pfx}_migrate", "#{pfx}_publish", 'vm_rename'].include?(params[:pressed])
          @refresh_div = "main_div"
          @refresh_partial = "layouts/gtl"
          show
          @display = "vms"
        end
      end
    else
      @refresh_div = "main_div" # Default div for button.rjs to refresh
      tag(Storage) if params[:pressed] == "storage_tag"
      scanstorage if params[:pressed] == "storage_scan"
      deletestorages if params[:pressed] == "storage_delete"
      custom_buttons if params[:pressed] == "custom_button"
    end

    return if ["custom_button"].include?(params[:pressed]) # custom button screen, so return, let custom_buttons method handle everything
    return if ["storage_tag"].include?(params[:pressed]) && @flash_array.nil? # Tag screen showing, so return

    check_if_button_is_implemented

    if single_delete_test
      single_delete_redirect
    elsif params[:pressed].ends_with?("_edit") ||
          ["#{pfx}_miq_request_new", "#{pfx}_clone", "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed]) ||
          params[:pressed] == 'vm_rename' && @flash_array.nil?
      render_or_redirect_partial(pfx)
    elsif !flash_errors? && @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    else
      javascript_flash unless performed?
    end
  end

  def files
    show_association('files', _('All Files'), :storage_files, StorageFile, 'files')
  end

  def disk_files
    show_association('disk_files',
                     _('VM Provisioned Disk Files'),
                     :storage_files,
                     StorageFile,
                     'disk_files')
  end

  def snapshot_files
    show_association('snapshot_files',
                     _('VM Snapshot Files'),
                     :storage_files,
                     StorageFile,
                     'snapshot_files')
  end

  def vm_ram_files
    show_association('vm_ram_files',
                     _('VM Memory Files'),
                     :storage_files, StorageFile,
                     'vm_ram_files')
  end

  def vm_misc_files
    show_association('vm_misc_files',
                     _('Other VM Files'),
                     :storage_files, StorageFile,
                     'vm_misc_files')
  end

  def debris_files
    show_association('debris_files',
                     _('Non-VM Files'),
                     :storage_files, StorageFile,
                     'debris_files')
  end

  def accordion_select
    @lastaction = "explorer"
    @explorer = true

    @sb[:storage_search_text] ||= {}
    @sb[:storage_search_text]["#{x_active_accord}_search_text"] = @search_text

    self.x_active_accord = params[:id].sub(/_accord$/, '')
    self.x_active_tree   = "#{x_active_accord}_tree"
    get_node_info(x_node)

    @search_text = @sb[:storage_search_text]["#{x_active_accord}_search_text"]

    load_or_clear_adv_search
    replace_right_cell(:nodetype => x_node)
  end

  def load_or_clear_adv_search
    adv_search_build("Storage")
    session[:edit] = @edit
    @explorer = true

    if x_tree[:tree] != :storage_tree || x_node == "root"
      listnav_search_selected(0)
    else
      @nodetype, id = parse_nodetype_and_id(valid_active_node(x_node))

      if x_tree[:tree] == :storage_tree && (@nodetype == "root" || @nodetype == "ms")
        search_id = @nodetype == "root" ? 0 : id
        listnav_search_selected(search_id) unless params.key?(:search_text) # Clear or set the adv search filter
        if @edit[:adv_search_applied] &&
           MiqExpression.quick_search?(@edit[:adv_search_applied][:exp]) &&
           %w[reload tree_select].include?(params[:action])
          self.x_node = params[:id]
          quick_search_show
          return
        end
      end
    end
  end

  def x_show
    @record = identify_record(params[:id], Storage)
    generic_x_show
  end

  def tree_select
    @lastaction = "explorer"
    self.x_active_tree = params[:tree] if params[:tree]
    self.x_node        = params[:id]

    load_or_clear_adv_search
    replace_right_cell(:nodetype => x_node)
  end

  def show_record(_id = nil)
    @display = params[:display] || "main" unless pagination_or_gtl_request?
    @lastaction = "show"
    @showtype   = "config"

    if @record.nil?
      add_flash(_("Error: Record no longer exists in the database"), :error)
      if request.xml_http_request? && params[:id] # Is this an Ajax request clicking on a node that no longer exists?
        @delete_node = params[:id]                # Set node to be removed from the tree
      end
      return
    end

    return unless @display == 'main'
    @showtype = "main"
  end

  def explorer
    @breadcrumbs = []
    @explorer = true
    @lastaction = "explorer"

    # if AJAX request, replace right cell, and return
    if request.xml_http_request?
      replace_right_cell
      return
    end

    params.instance_variable_get(:@parameters).merge!(session[:exp_parms]) if session[:exp_parms] # Grab any explorer parm overrides
    session.delete(:exp_parms)
    @in_a_form = false
    if params[:id] # If a tree node id came in, show in one of the trees
      nodetype, id = params[:id].split("-")
      # treebuilder initializes x_node to root first time in locals_for_render,
      # need to set this here to force & activate node when link is clicked outside of explorer.
      self.x_active_tree = :storage_tree
      self.x_node = "#{nodetype}-#{id}"
    end

    build_accordions_and_trees
    get_tagdata(@record) if @record
    @lastaction = "explorer" # restore the explorer layout, which was changed by process_show_list() to "show_list"

    render :layout => "application"
  end

  def tagging
    assert_privileges("storage_tag") if x_active_accord == :storage
    tagging_edit('Storage', false)
    render_tagging_form
  end

  def storage_delete
    deletestorages
  end

  def features
    [
      {
        :role     => "storage",
        :role_any => true,
        :name     => :storage,
        :title    => _("Datastores")
      },
      {
        :role     => "storage_pod",
        :role_any => true,
        :name     => :storage_pod,
        :title    => _("Datastore Clusters")
      }
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def get_node_info(node, _show_list = true)
    node = valid_active_node(node)
    session_reset # Reset session to same values as first time in
    case x_active_tree
    when :storage_tree     then storage_get_node_info(node)
    when :storage_pod_tree then storage_pod_get_node_info(node)
    end
    set_right_cell_text

    if @edit&.fetch_path(:adv_search_applied, :qs_exp) # If qs is active, save it in history
      x_history_add_item(:id     => x_node,
                         :qs_exp => @edit[:adv_search_applied][:qs_exp],
                         :text   => @right_cell_text)
    else
      x_history_add_item(:id => node, :text => @right_cell_text) # Add to history pulldown array
    end
  end

  def leaf_record
    get_node_info(x_node)
    @delete_node = params[:id] if @replace_trees
    type, _id = parse_nodetype_and_id(x_node)
    type && ["Storage"].include?(TreeBuilder.get_model_for_prefix(type))
  end

  def storage_record?(node = x_node)
    type, _id = parse_nodetype_and_id(node)
    type && ["Storage"].include?(TreeBuilder.get_model_for_prefix(type))
  end

  def valid_storage_record?(record)
    record.try(:id)
  end

  def replace_right_cell(options = {})
    # FIXME: nodetype passed here, but not used
    _nodetype, replace_trees = options.values_at(:nodetype, :replace_trees)
    replace_trees = @replace_trees if @replace_trees # get_node_info might set this
    # FIXME
    @explorer = true

    if params[:action] == 'x_button' && params[:pressed] == 'storage_tag'
      tagging
      return
    end
    return if @in_a_form
    record_showing = leaf_record

    trees = build_replaced_trees(replace_trees, %i[storage storage_pod])

    presenter = rendering_objects
    update_partials(record_showing, presenter)
    replace_search_box(presenter, :nameonly => x_active_tree == :storage)
    handle_bottom_cell(presenter)
    reload_trees_by_presenter(presenter, trees)
    rebuild_toolbars(record_showing, presenter)
    case x_active_tree
    when :storage_tree
      presenter.update(:main_div, r[:partial => "storage_list"])
    when :storage_pod_tree
      presenter.update(:main_div, r[:partial => "storage_pod_list"])
    end
    presenter[:right_cell_text] = @right_cell_text
    presenter[:clear_gtl_list_grid] = @gtl_type && @gtl_type != 'list'
    presenter[:osf_node] = x_node # Open, select, and focus on this node

    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    render :json => presenter.for_render
  end

  def search_text_type(node)
    return "storage" if storage_record?(node)
    node
  end

  def update_partials(record_showing, presenter)
    if record_showing
      get_tagdata(@record)
      presenter.hide(:form_buttons_div)
      presenter.update(:main_div, r[:partial => "layouts/textual_groups_generic"])
    elsif valid_storage_record?(@record)
      presenter.hide(:form_buttons_div)
      presenter.update(:main_div, r[:partial => "storage_list",
                                    :locals  => {:controller => 'storage'}])
    else
      presenter.update(:main_div, r[:partial => 'layouts/x_gtl'])
    end
  end

  def replace_search_box(presenter, locals = {})
    super(presenter, locals)

    presenter[:clear_gtl_list_grid] = @gtl_type && @gtl_type != 'list'
  end

  def handle_bottom_cell(presenter)
    # Handle bottom cell
    if @pages || @in_a_form
      if @pages && !@in_a_form
        presenter.hide(:form_buttons_div)
      elsif @in_a_form
        presenter.remove_paging.show(:form_buttons_div)
      end
      presenter.show(:paging_div)
    else
      presenter.hide(:paging_div)
    end
  end

  def render_tagging_form
    return if %w[cancel save].include?(params[:button])
    @in_a_form = true
    @right_cell_text = _("Edit Tags for Datastore")
    clear_flash_msg
    presenter = rendering_objects
    update_tagging_partials(presenter)
    # update_title(presenter)
    rebuild_toolbars(false, presenter)
    handle_bottom_cell(presenter)

    render :json => presenter.for_render
  end

  def rebuild_toolbars(record_showing, presenter)
    c_tb = build_toolbar(center_toolbar_filename) unless @in_a_form
    h_tb = build_toolbar('x_history_tb')
    v_tb = build_toolbar('x_gtl_view_tb') unless record_showing || (x_active_tree == :storage_pod_tree && x_node == 'root') || @in_a_form
    cb_tb = build_toolbar(custom_toolbar_explorer)

    presenter.reload_toolbars(:history => h_tb, :center => c_tb, :view => v_tb, :custom => cb_tb)
    presenter.set_visibility(h_tb.present? || c_tb.present? || v_tb.present?, :toolbar)
    presenter[:record_id] = @record.try(:id)

    # Hide/show searchbox depending on if a list is showing
    presenter.set_visibility(display_adv_searchbox, :adv_searchbox_div)
    presenter[:clear_search_toggle] = clear_search_status

    presenter.hide(:blocker_div) unless @edit && @edit[:adv_search_open]
    presenter.hide(:quicksearchbox)
    presenter[:hide_modal] = true

    presenter[:lock_sidebar] = @in_a_form
  end

  def display_adv_searchbox
    if !@record.nil? && @record[:type] == 'StorageCluster'
      return false
    end
    !(@in_a_form || (x_active_tree == :storage_tree && @record) || (x_active_tree == :storage_pod_tree && (x_node == 'root' || @record)))
  end

  def breadcrumb_name(_model)
    _("Datastores")
  end

  def tagging_explorer_controller?
    @explorer
  end

  # called by explorer.rb x_button
  def storage_scan
    scanstorage
  end

  private

  def session_reset
    if @record
      session[:edit] = @edit = nil
      session[:adv_search]['Storage'] = nil if session[:adv_search]
    end
  end

  def set_right_cell_text
    @right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && @nodetype != 'ds'
    @right_cell_text += @edit[:adv_search_applied][:text] if x_tree && x_tree[:tree] == :storage_tree && @edit && @edit[:adv_search_applied]
  end

  def textual_group_list
    [
      %i[properties registered_vms relationships],
      %i[content smart_management]
    ]
  end
  helper_method :textual_group_list

  def custom_toolbar_explorer
    @record.present? ? Mixins::CustomButtons::Result.new(:single) : Mixins::CustomButtons::Result.new(:list)
  end

  def breadcrumbs_options
    {
      :breadcrumbs    => [
        {:title => _("Compute")},
        {:title => _("Infrastructure")},
        {:title => _("Datastores"), :url => File.join(controller_url, 'explorer')},
      ],
      :include_record => true,
    }
  end

  menu_section :inf
  has_custom_buttons
end
