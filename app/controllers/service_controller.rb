class ServiceController < ApplicationController
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  SERVICE_X_BUTTON_ALLOWED_ACTIONS = {
    'service_delete'      => :service_delete,
    'service_edit'        => :service_edit,
    'service_ownership'   => :service_ownership,
    'service_tag'         => :service_tag_edit,
    'service_retire'      => :service_retire,
    'service_retire_now'  => :service_retire_now,
    'service_reconfigure' => :service_reconfigure
  }.freeze

  def button
    case params[:pressed]
    when 'generic_object_tag'
      tag(GenericObject)
    when "custom_button"
      @display == 'generic_objects' ? generic_object_custom_buttons : custom_buttons
    end
  end

  def generic_object_custom_buttons
    display_options = {}
    ids = @lastaction == 'generic_object' ? @sb[:rec_id] : 'LIST'
    display_options[:display] = @display
    display_options[:record_id] = parse_nodetype_and_id(x_node).last
    display_options[:display_id] = params[:id] if @lastaction == 'generic_object'
    custom_buttons(ids, display_options)
  end

  def x_button
    generic_x_button(SERVICE_X_BUTTON_ALLOWED_ACTIONS)
  end

  def title
    _("My Services")
  end

  # Service show selected, redirect to proper controller
  def show
    @record = Service.find(params[:id].to_i)
    @lastaction = "show"

    @gtl_url = "/show"

    set_display

    case @display
    when 'generic_objects'
      show_generic_object
      return
    when 'custom_button_events'
      display_nested_list(@display)
      return
    end

    unless @explorer
      tree_node_id = TreeBuilder.build_node_id(@record)
      redirect_to(:controller => "service",
                  :action     => "explorer",
                  :id         => tree_node_id)
      return
    end
    redirect_to(:action => 'show', :controller => @record.class.base_model.to_s.underscore, :id => @record.id)
  end

  def set_display
    @display = params[:display]
    @display ||= default_display unless pagination_or_gtl_request?
    @display ||= 'generic_objects' if role_allows?(:feature => "generic_object_view") && @record.number_of(:generic_objects).positive?
  end

  def show_generic_object
    if params[:generic_object_id]
      show_single_generic_object
    else
      display_nested_list(@display)
    end
  end

  def show_list
    flash_to_session
    redirect_to(:action => 'explorer')
  end

  def explorer
    @explorer   = true
    @lastaction = "explorer"

    # if AJAX request, replace right cell, and return
    if request.xml_http_request?
      replace_right_cell
      return
    end

    x_node_to_set = nil

    if params[:id] # Tree node id came in, show it in the tree.
      @find_with_aggregates = true
      nodetype, id = params[:id].split("-")
      x_node_to_set = "#{nodetype}-#{id}"
    end

    @breadcrumbs.clear if @breadcrumbs.present?
    build_accordions_and_trees(x_node_to_set)

    params.instance_variable_get(:@parameters).merge!(session[:exp_parms]) if session[:exp_parms] # Grab any explorer parm overrides
    session.delete(:exp_parms)
    @in_a_form = false

    render :layout => "application"
  end

  def identify_service(id = nil)
    @st = @record = identify_record(id || params[:id])
  end

  # ST clicked on in the explorer right cell
  def x_show
    identify_service(params[:id])
    generic_x_show
  end

  def service_edit
    assert_privileges("service_edit")
    @explorer = true
    case params[:button]
    when "cancel"
      service = find_record_with_rbac(Service, params[:id])
      add_flash(_("Edit of Service \"%{name}\" was cancelled by the user") % {:name => service.name})
      replace_right_cell
    when "save", "add"
      service = find_record_with_rbac(Service, params[:id])
      service_set_record_vars(service)

      begin
        service.save
      rescue => bang
        add_flash(_("Error during 'Service Edit': %{message}") % {:message => bang.message}, :error)
      else
        add_flash(_("Service \"%{name}\" was saved") % {:name => service.name})
      end
      replace_right_cell(:replace_trees => [:svcs])
    when "reset", nil # Reset or first time in
      checked = find_checked_items
      checked[0] = params[:id] if checked.blank? && params[:id]
      @service = find_record_with_rbac(Service, checked[0])
      @in_a_form = true
      replace_right_cell(:action => "service_edit")
      return
    end
  end

  def service_reconfigure
    @explorer = true
    service = Service.find_by(:id => params[:id])
    service_template = service.service_template
    resource_action = service_template.resource_actions.find_by(:action => 'Reconfigure') if service_template

    @right_cell_text = _("Reconfigure Service \"%{name}\"") % {:name => service.name}
    dialog_locals = {:resource_action_id => resource_action.id, :target_id => service.id}
    replace_right_cell(:action => "reconfigure_dialog", :dialog_locals => dialog_locals)
  end

  def service_form_fields
    service = Service.find(params[:id])

    render :json => {
      :name        => service.name,
      :description => service.description
    }
  end

  # display a single generic object
  #
  def show_single_generic_object
    return unless init_show_variables

    @lastaction = 'generic_object'
    @item = @record.generic_objects.find { |e| e[:id] == params[:generic_object_id].to_i }
    drop_breadcrumb(:name => _("%{name} (All Generic Objects)") % {:name => @record.name}, :url => show_link(@record, :display => 'generic_objects'))
    drop_breadcrumb(:name => @item.name, :url => show_link(@record, :display => 'generic_objects', :generic_object_id => params[:generic_object_id]))
    @view = get_db_view(GenericObject)
    @sb[:rec_id] = params[:generic_object_id]
    @record = @item
    show_item
  end

  def self.display_methods
    %w[generic_objects custom_button_events]
  end

  def display_generic_objects
    nested_list(GenericObject)
  end

  private

  def record_class
    Service
  end

  def sanitize_output(stdout)
    htm = stdout.gsub('"', '\"')

    regex_map = {
      /\\'/ => "'",
      /'/   => "\\\\'",
      /{{/  => '\{\{',
      /}}/  => '\}\}'
    }
    regex_map.each_pair { |f, t| htm.gsub!(f, t) }
    htm
  end
  helper_method :sanitize_output

  def textual_group_list
    if @item && @item.kind_of?(GenericObject)
      [%i[go_properties attribute_details_list methods go_relationships]]
    elsif %w[ServiceAnsiblePlaybook ServiceAnsibleTower].include?(@record.type)
      [%i[properties miq_custom_attributes], %i[lifecycle tags generic_objects]]
    else
      [%i[properties lifecycle relationships generic_objects miq_custom_attributes], %i[vm_totals tags]]
    end
  end
  helper_method :textual_group_list

  def textual_provisioning_group_list
    [%i[provisioning_results provisioning_plays], %i[provisioning_details provisioning_credentials]]
  end
  helper_method :textual_provisioning_group_list

  def textual_retirement_group_list
    [%i[retirement_results retirement_plays], %i[retirement_details retirement_credentials]]
  end
  helper_method :textual_retirement_group_list

  def textual_tower_job_group_list
    [%i[tower_job_results tower_job_plays], %i[tower_job_details tower_job_credentials]]
  end
  helper_method :textual_tower_job_group_list

  def features
    [
      {
        :role     => "service",
        :role_any => true,
        :name     => :svcs,
        :title    => _("Services")
      }
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def service_ownership
    @explorer = true
    set_ownership
    replace_right_cell(:action => 'ownership')
  end

  def service_tag_edit
    @explorer = true
    service_tag
    replace_right_cell(:action => 'tag')
  end

  def service_retire
    @explorer = true
    retirevms
    replace_right_cell(:action => 'retire')
  end

  def service_retire_now
    @explorer = true
    retirevms_now
  end

  def service_set_record_vars(svc)
    svc.name = params[:name] if params[:name]
    svc.description = params[:description] if params[:description]
  end

  def service_delete
    assert_privileges("service_delete")
    @explorer = true
    elements = []
    if params[:id] # delete service from its details page
      elements.push(params[:id])
      deleted_service = Service.find(params[:id].to_i) # service which is going to be deleted
      process_elements(elements, Service, 'destroy') unless elements.empty?
      self.x_node = deleted_service.retired ? "xx-rsrv" : "xx-asrv" # set x_node for returning to Active or Retired Services
    else # delete choosen service(s), choosen by checking appropriate checkbox(es)
      elements = find_checked_items
      if elements.empty?
        add_flash(_("No Services were selected for deletion"), :error)
      end
      process_elements(elements, Service, 'destroy') unless elements.empty?
    end
    params[:id] = nil
    replace_right_cell(:replace_trees => [:svcs])
  end

  def get_record_display_name(record)
    record.name
  end

  # Get all info for the node about to be displayed
  def get_node_info(treenodeid, _show_list = true)
    @nodetype, id = parse_nodetype_and_id(valid_active_node(treenodeid))
    # resetting action that was stored during edit to determine what is being edited
    @sb[:action] = nil

    # Set session properly - the same as when the filter is cleared
    # No need to edit session here again if adv_search_clear was called
    listnav_search_selected(0) if session[:adv_search] && %w[adv_search_button adv_search_clear x_search_by_name].exclude?(params[:action])

    case TreeBuilder.get_model_for_prefix(@nodetype)
    when "Service"
      show_record(id)
      drop_breadcrumb(:name => _('Services'), :url => '/service/explorer') if @breadcrumbs.empty?
      @right_cell_text = _("Service \"%{name}\"") % {:name => @record.name}
      @no_checkboxes = true
      @gtl_type = "grid"
      @items_per_page = ONE_MILLION
      @view, @pages = get_view(Vm, :parent => @record, :parent_method => :all_vms, :all_pages => true) # Get the records (into a view) and the paginator
    when "Hash"
      case id
      when 'asrv'
        process_show_list(:named_scope => [[:retired, false], :displayed])
        @right_cell_text = _("Active Services")
      when 'rsrv'
        process_show_list(:named_scope => %i[retired displayed])
        @right_cell_text = _("Retired Services")
      end
    when "MiqSearch", nil # nil if applying a filter from Advanced search - and @nodetype is root
      load_adv_search unless @nodetype == "root" # Select/load filter from Global/My Filters
      process_show_list
      @right_cell_text = _("All Services")
    end
    @right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && @nodetype != 's'
    @right_cell_text += @edit[:adv_search_applied][:text] if x_tree && @edit && @edit[:adv_search_applied]
  end

  # Select/load filter from Global/My Filters
  def load_adv_search
    adv_search_build("Service")
    session[:edit] = @edit
    @explorer = true
    @nodetype, id = parse_nodetype_and_id(valid_active_node(x_node))

    if @nodetype == "ms"
      listnav_search_selected(id) unless params.key?(:search_text)
      if @edit[:adv_search_applied] &&
         MiqExpression.quick_search?(@edit[:adv_search_applied][:exp]) &&
         %w[reload tree_select].include?(params[:action])
        self.x_node = params[:id]
        quick_search_show
      end
    end
  end

  # set partial name and cell header for edit screens
  def set_right_cell_vars(action)
    case action
    when "dialog_provision"
      partial = "shared/dialogs/dialog_provision"
      header = @right_cell_text
      action = "dialog_form_button_pressed"
    when "ownership"
      partial = "shared/views/ownership"
      header = _("Set Ownership for Service")
      action = "ownership_update"
    when "retire"
      partial = "shared/views/retire"
      header = _("Set/Remove retirement date for Service")
      action = "retire"
    when "reconfigure_dialog"
      partial = "shared/dialogs/reconfigure_dialog"
      header = @right_cell_text
      action = nil
    when "service_edit"
      partial = "service_form"
      header = _("Editing Service \"%{name}\"") % {:name => @service.name}
      action = "service_edit"
    when "tag", 'service_tag'
      partial = "layouts/tagging"
      header = _("Edit Tags for Service")
      action = "service_tag"
    else
      action = nil
    end
    return partial, action, header
  end

  # Replace the right cell of the explorer
  def replace_right_cell(options = {})
    if @flash_array && @refresh_partial == "layouts/flash_msg"
      javascript_flash
      return
    end
    action, replace_trees = options.values_at(:action, :replace_trees)
    @explorer = true
    partial, action_url, @right_cell_text = set_right_cell_vars(action) if action # Set partial name, action and cell header
    get_node_info(x_node) if !action && !@in_a_form && !params[:display]
    replace_trees = @replace_trees if @replace_trees # get_node_info might set this
    type, _ = parse_nodetype_and_id(x_node)
    record_showing = type && ["Service"].include?(TreeBuilder.get_model_for_prefix(type))
    if x_active_tree == :svcs_tree && !@in_a_form && !@sb[:action]
      if record_showing && @sb[:action].nil?
        cb_tb = build_toolbar(Mixins::CustomButtons::Result.new(:single))
      else
        cb_tb = build_toolbar(Mixins::CustomButtons::Result.new(:list))
        v_tb = build_toolbar("x_gtl_view_tb")
      end
      c_tb = build_toolbar(center_toolbar_filename)
    end

    presenter = ExplorerPresenter.new(
      :active_tree     => x_active_tree,
      :right_cell_text => @right_cell_text
    )

    reload_trees_by_presenter(presenter, build_replaced_trees(replace_trees, %i[svcs]))

    # Replace right cell divs
    presenter.update(
      :main_div,
      if %w[dialog_provision ownership retire service_edit tag service_tag reconfigure_dialog].include?(action)
        r[:partial => partial, :locals => options[:dialog_locals]]
      elsif params[:display]
        r[:partial => 'layouts/x_gtl', :locals => {:controller => "vm", :action_url => @lastaction}]
      elsif record_showing
        @selected_ids = [] # FIXME: hack to hide checkboxes
        r[:partial => "service/svcs_show", :locals => {:controller => "service"}]
      else
        r[:partial => "layouts/x_gtl"]
      end
    )
    if %w[ownership tag service_tag].include?(action)
      presenter.show(:form_buttons_div).remove_paging.hide(:toolbar).show(:paging_div)
      if %w[tag service_tag].include?(action)
        locals = {:action_url => action_url}
        locals[:multi_record] = true # need save/cancel buttons on edit screen even tho @record.id is not there
        locals[:record_id]    = @sb[:rec_id] || @edit[:object_ids] && @edit[:object_ids][0]
      elsif action == "ownership"
        locals = {:action_url => action_url}
        locals[:multi_record] = true
        presenter.update(:form_buttons_div, r[:partial => "layouts/angular/paging_div_buttons"])
      else
        locals = {:record_id => @edit[:rec_id], :action_url => action_url}
        presenter.update(:form_buttons_div, r[:partial => "layouts/x_edit_buttons", :locals => locals])
      end
    elsif (action != "retire") && (record_showing ||
        (@pages && (@items_per_page == ONE_MILLION || @pages[:items] == 0)))
      # Added so buttons can be turned off even tho div is not being displayed it still pops up Abandon changes box
      # when trying to change a node on tree after saving a record
      presenter.hide(:form_buttons_div, :paging_div).show(:toolbar)
    else
      presenter.hide(:form_buttons_div).show(:toolbar, :paging_div)
    end

    # Clear the JS gtl_list_grid var if changing to a type other than list
    presenter[:clear_gtl_list_grid] = @gtl_type && @gtl_type != 'list'

    presenter.reload_toolbars(:center => c_tb, :view => v_tb, :custom => cb_tb)

    presenter.set_visibility(c_tb.present? || v_tb.blank?, :toolbar)

    presenter[:record_id] = determine_record_id_for_presenter

    presenter[:lock_sidebar] = @edit && @edit[:current]
    presenter[:osf_node] = x_node

    # Hide/show searchbox depending on if a list is showing
    presenter.set_visibility(!(@record || @in_a_form), :adv_searchbox_div)
    presenter[:clear_search_toggle] = clear_search_status

    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    render :json => presenter.for_render
  end

  def show_record(id = nil)
    @display = params[:display] || "main" unless pagination_or_gtl_request?
    @lastaction = "show"
    @showtype = "config"
    identify_service(id)
    return if record_no_longer_exists?(@record)

    get_tagdata(@record)
  end

  # Overwriting from application controller
  #
  # FIXME:  Find a more graceful way of adding .with_aggregates to the @record
  def find_record_with_rbac(db, id)
    options = @find_with_aggregates ? { :named_scope => :with_aggregates } : {}
    super(db, id, options)
  end

  def tagging_explorer_controller?
    # this controller behaves explorer-like for services and non-explorer-like for GO
    @tagging == 'Service'
  end

  def get_session_data
    super
    @layout     = "services"
    @options    = session[:prov_options]
  end

  def set_session_data
    super
    session[:prov_options] = @options if @options
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Services")},
        {:title => _("My services"), :url => (url_for(:action => 'explorer', :controller => controller_name) if generic_objects_list?)},
      ],
      :record_info => (hide_record_info? ? {} : @service),
      :ancestry    => Service,
      :not_tree    => generic_objects_list?,
    }
  end

  def generic_objects_list?
    params[:display] == 'generic_objects'
  end

  def hide_record_info?
    generic_objects_list? && !params[:generic_object_id]
  end

  menu_section :svc
  has_custom_buttons
end
