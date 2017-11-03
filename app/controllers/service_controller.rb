class ServiceController < ApplicationController
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

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
  }

  def button
    if @lastaction == 'generic_objects'
      params[:id] = 'LIST'
    elsif @lastaction.starts_with?('generic_objects')
      params[:id]     #params[:id] = @sb[:rec_id]
    end
    custom_buttons if params[:pressed] == "custom_button"
    return if ["custom_button"].include?(params[:pressed])    # custom button screen, so return, let custom_buttons method handle everything
    tag(GenericObject) if @display == 'generic_objects' && params[:pressed] == 'generic_object_tag'
  end

  def x_button
    generic_x_button(SERVICE_X_BUTTON_ALLOWED_ACTIONS)
  end

  def title
    _("My Services")
  end

  # Service show selected, redirect to proper controller
  def show
    @record = Service.find(from_cid(params[:id]))

    @gtl_url = "/show"
    @display = params[:display] if params[:display]

    if self.class.display_methods.include?(@display)
      params[:display] = @display
      display_nested_list(@display)
      return
    end

    unless @explorer
      tree_node_id = TreeBuilder.build_node_id(@record)
      redirect_to :controller => "service",
                  :action     => "explorer",
                  :id         => tree_node_id
      return
    end
    redirect_to(:action => 'show', :controller => @record.class.base_model.to_s.underscore, :id => @record.id)
  end

  def show_list
    redirect_to :action => 'explorer', :flash_msg => @flash_array.try(:fetch_path, 0, :message)
  end

  def show_details(db, options = {})
    association = options[:association]
    conditions  = options[:conditions]
    # generate the grid/tile/list url to come back here when gtl buttons are pressed
    @gtl_url       = "/#{@db}/#{@listicon.pluralize}/#{@record.id}?"
    @no_checkboxes = false
    @showlinks     = true
    @view, @pages = get_view(db,
                             :parent      => @record,
                             :association => association,
                             :conditions  => conditions,
                             :dbname      => "#{@db}item") # Get the records into a view & paginator

    @refresh_partial = "service/details"
    replace_right_cell(:action => "generic_objects", :showtype => "details")
  end

  # show a single item from a detail list
  def show_item
    replace_right_cell(:action => "generic_objects", :showtype => "item")
  end

  def explorer
    @explorer   = true
    @lastaction = "explorer"

    # if AJAX request, replace right cell, and return
    if request.xml_http_request?
      replace_right_cell
      return
    end

    build_accordions_and_trees

    if params[:id]  # If a tree node id came in, show in one of the trees
      @find_with_aggregates = true
      nodetype, id = params[:id].split("-")
      self.x_node = "#{nodetype}-#{to_cid(id)}"
      get_node_info(x_node)
    end

    params.instance_variable_get(:@parameters).merge!(session[:exp_parms]) if session[:exp_parms]  # Grab any explorer parm overrides
    session.delete(:exp_parms)
    @in_a_form = false

    render :layout => "application"
  end

  def identify_service(id = nil)
    @st = @record = identify_record(id || params[:id])
  end

  # ST clicked on in the explorer right cell
  def x_show
    identify_service(from_cid(params[:id]))
    generic_x_show(x_tree(:svcs_tree))
  end

  def service_edit
    assert_privileges("service_edit")
    @explorer = true
    case params[:button]
    when "cancel"
      service = find_record_with_rbac(Service, params[:id])
      add_flash(_("Edit of Service \"%{name}\" was cancelled by the user") % {:name => service.description})
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
    s = Service.find_by_id(from_cid(params[:id]))
    st = s.service_template
    ra = st.resource_actions.find_by_action('Reconfigure') if st
    if ra && ra.dialog_id
      @right_cell_text = _("Reconfigure Service \"%{name}\"") % {:name => st.name}
      options = {
        :header      => @right_cell_text,
        :target_id   => s.id,
        :target_kls  => s.class.name,
        :dialog      => s.options[:dialog],
        :dialog_mode => :reconfigure
      }
      dialog_initialize(ra, options)
    end
  end

  def service_form_fields
    service = Service.find_by_id(params[:id])

    render :json => {
      :name        => service.name,
      :description => service.description
    }
  end

  def generic_objects
    return unless init_show_variables

    @lastaction = "generic_objects"
    id = params[:show] || params[:x_show]
    if id.present?
      @item = @record.generic_objects.find(from_cid(id)).first
      item_breadcrumbs(_("Generic Objects"), 'generic_objects')
      @view = get_db_view(GenericObject, :association => "generic_objects")
      @lastaction = "generic_objects_#{@item_id}"
      @sb[:rec_id] = @item.id
      show_item
    else
      drop_breadcrumb(:name => _("%{name} (Generic Objects)") % {:name => @record.name},
                      :url  => "/#{@db}/generic_objects/#{@record.id}")
      @listicon = "generic_objects"
      @explorer = true
      show_details(GenericObject, :association => "generic_objects")
    end
  end

  def self.display_methods
    %w(generic_objects)
  end

  def display_generic_objects
    nested_list("generic_object", GenericObject)
  end

  private

  def sanitize_output(stdout)
    htm = stdout.gsub('"', '\"')

    regex_map = {
      /'/  => "\\\\'",
      /{{/ => '\{\{',
      /}}/ => '\}\}'
    }
    regex_map.each_pair { |f, t| htm.gsub!(f, t) }
    htm
  end
  helper_method :sanitize_output

  def textual_group_list
    if @record.type == "ServiceAnsiblePlaybook"
      [%i(properties), %i(lifecycle tags)]
    else
      [%i(properties lifecycle relationships generic_objects miq_custom_attributes), %i(vm_totals tags)]
    end
  end
  helper_method :textual_group_list

  def textual_provisioning_group_list
    [%i(provisioning_results provisioning_plays), %i(provisioning_details provisioning_credentials)]
  end
  helper_method :textual_provisioning_group_list

  def textual_retirement_group_list
    [%i(retirement_results retirement_plays), %i(retirement_details retirement_credentials)]
  end
  helper_method :textual_retirement_group_list

  def features
    [ApplicationController::Feature.new_with_hash(:role     => "service",
                                                  :role_any => true,
                                                  :name     => :svcs,
                                                  :title    => _("Services"))]
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
    replace_right_cell
  end

  def service_set_record_vars(svc)
    svc.name = params[:name] if params[:name]
    svc.description = params[:description] if params[:description]
  end

  def service_delete
    assert_privileges("service_delete")
    @explorer = true
    elements = []
    if params[:id]
      elements.push(params[:id])
      process_elements(elements, Service, 'destroy') unless elements.empty?
      self.x_node = "root"
    else # showing 1 element, delete it
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
    case TreeBuilder.get_model_for_prefix(@nodetype)
    when "Service"  # VM or Template record, show the record
      show_record(from_cid(id))
      @right_cell_text = _("%{model} \"%{name}\"") % {:name => @record.name, :model => ui_lookup(:model => TreeBuilder.get_model_for_prefix(@nodetype))}
      @no_checkboxes = true
      @gtl_type = "grid"
      @items_per_page = ONE_MILLION
      @view, @pages = get_view(Vm, :parent => @record, :parent_method => :all_vms, :all_pages => true)  # Get the records (into a view) and the paginator
    when "Hash"
      if id == "asrv"
        process_show_list(:named_scope => [[:retired, false], :displayed])
        @right_cell_text = _("Active Services")
      else
        process_show_list(:named_scope => [:retired, :displayed])
        @right_cell_text = _("Retired Services")
      end
    when "MiqSearch"
      load_adv_search # Select/load filter from Global/My Filters
      @right_cell_text = _("All Services")
    else      # Get list of child Catalog Items/Services of this node
      if x_node == "root"
        process_show_list(:where_clause => "ancestry is null")
        @right_cell_text = if x_active_tree == :svcs_tree
                             _("All Services")
                           else
                             _("All Service Catalog Items")
                           end
      else
        show_record(from_cid(id))
        typ = x_active_tree == :svcs_tree ? "Service" : TreeBuilder.get_model_for_prefix(@nodetype)
        @right_cell_text = _("%{model} \"%{name}\"") % {:name => @record.name, :model => ui_lookup(:model => typ)}
      end
    end
    @right_cell_text += @edit[:adv_search_applied][:text] if x_tree && @edit && @edit[:adv_search_applied]

    if @edit && @edit.fetch_path(:adv_search_applied, :qs_exp) # If qs is active, save it in history
      x_history_add_item(:id     => x_node,
                         :qs_exp => @edit[:adv_search_applied][:qs_exp],
                         :text   => @right_cell_text)
    else
      x_history_add_item(:id => treenodeid, :text => @right_cell_text) # Add to history pulldown array
    end
  end

  # Select/load filter from Global/My Filters
  def load_adv_search
    adv_search_build("Service")
    session[:edit] = @edit
    @explorer = true
    @nodetype, id = parse_nodetype_and_id(valid_active_node(x_node))

    if @nodetype == "ms"
      listnav_search_selected(from_cid(id)) unless params.key?(:search_text)
      if @edit[:adv_search_applied] &&
         MiqExpression.quick_search?(@edit[:adv_search_applied][:exp]) &&
         %w(reload tree_select).include?(params[:action])
        self.x_node = params[:id]
        quick_search_show
      end
    end
  end

  # set partial name and cell header for edit screens
  def set_right_cell_vars(action, type = "details")
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
    when "service_edit"
      partial = "service_form"
      header = _("Editing Service \"%{name}\"") % {:name => @service.name}
      action = "service_edit"
    when "tag"
      partial = "layouts/tagging"
      header = _("Edit Tags for Service")
      action = "service_tag"
    when "generic_objects"
      table = request.parameters["controller"]
      header = _("Generic Objects for %{service} \"%{name}\"") % {
        :service => ui_lookup(:table => table),
        :name    => @record.name
      }
      table = controller_name
      partial = if type == "details"
                  "layouts/x_gtl"
                elsif type == "item"
                  "layouts/item"
                end
      if type == "item"
        header = _("Generic Object \"%{item_name}\" for %{service} \"%{name}\"") % {
          :service   => ui_lookup(:table => table),
          :name      => @record.name,
          :item_name => @item.name
        }
        x_history_add_item(:id     => x_node,
                           :text   => header,
                           :action => action,
                           :item   => @item.id)
      end
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
    action, replace_trees, showtype = options.values_at(:action, :replace_trees, :showtype)
    @explorer = true
    partial, action_url, @right_cell_text = set_right_cell_vars(action, showtype) if action # Set partial name, action and cell header
    get_node_info(x_node) if !action && !@in_a_form && !params[:display]
    replace_trees = @replace_trees if @replace_trees  # get_node_info might set this
    type, = parse_nodetype_and_id(x_node)
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
    h_tb = build_toolbar("x_history_tb") unless @in_a_form

    presenter = ExplorerPresenter.new(
      :active_tree     => x_active_tree,
      :right_cell_text => @right_cell_text
    )

    reload_trees_by_presenter(presenter, build_replaced_trees(replace_trees, %i(svcs)))

    # Replace right cell divs
    presenter.update(:main_div,
      if ["dialog_provision", "ownership", "retire", "service_edit", "tag"].include?(action)
        r[:partial => partial]
      elsif params[:display]
        r[:partial => 'layouts/x_gtl', :locals => {:controller => "vm", :action_url => @lastaction}]
      elsif record_showing
        if action
          partial_locals = { :controller => ''}
          if partial == 'layouts/x_gtl'
            cb_tb = build_toolbar(Mixins::CustomButtons::Result.new(:list))
            partial_locals[:action_url] = @lastaction
            presenter[:parent_id] = @record.id  # Set parent rec id for JS function miqGridSort to build URL
            presenter[:parent_class] = params[:controller] # Set parent class for URL also
          else
            partial_locals[:item_id] = @item.id
          end
          cb_tb = build_toolbar(Mixins::CustomButtons::Result.new(:single))
          r[:partial => partial, :locals => partial_locals]
        else
          r[:partial => "service/svcs_show", :locals => {:controller => "service"}]
        end
      else
        r[:partial => "layouts/x_gtl"]
      end
    )
    if %w(dialog_provision ownership tag).include?(action)
      presenter.show(:form_buttons_div).hide(:pc_div_1, :toolbar).show(:paging_div)
      if action == "dialog_provision"
        presenter.update(:form_buttons_div, r[:partial => "layouts/x_dialog_buttons",
                                              :locals  => {:action_url => action_url,
                                                           :record_id  => @edit[:rec_id]}])
      else
        if action == "tag"
          locals = {:action_url => action_url}
          locals[:multi_record] = true    # need save/cancel buttons on edit screen even tho @record.id is not there
          locals[:record_id]    = @sb[:rec_id] || @edit[:object_ids] && @edit[:object_ids][0]
        elsif action == "ownership"
          locals = {:action_url => action_url}
          locals[:multi_record] = true
          presenter.update(:form_buttons_div, r[:partial => "layouts/angular/paging_div_buttons"])
        else
          locals = {:record_id => @edit[:rec_id], :action_url => action_url}
        end
        presenter.update(:form_buttons_div, r[:partial => "layouts/x_edit_buttons", :locals => locals]) unless action == "ownership"
      end
    elsif (action != "retire") && (record_showing ||
        (@pages && (@items_per_page == ONE_MILLION || @pages[:items] == 0)))
      # Added so buttons can be turned off even tho div is not being displayed it still pops up Abandon changes box
      # when trying to change a node on tree after saving a record
      presenter.hide(:buttons_on).show(:toolbar).hide(:paging_div)
    else
      presenter.hide(:form_buttons_div).show(:pc_div_1, :toolbar, :paging_div)
    end

    # Clear the JS gtl_list_grid var if changing to a type other than list
    presenter[:clear_gtl_list_grid] = @gtl_type && @gtl_type != 'list'

    if @record.kind_of?(Dialog)
      @record.dialog_fields.each do |field|
        if %w(DialogFieldDateControl DialogFieldDateTimeControl).include?(field.type)
          presenter[:build_calendar] = {
            :date_from => field.show_past_dates ? nil : Time.zone.now,
          }
        end
      end
    end

    presenter.reload_toolbars(:history => h_tb, :center => c_tb, :view => v_tb, :custom => cb_tb)

    presenter.set_visibility(h_tb.present? || c_tb.present? || !v_tb.present?, :toolbar)

    presenter[:record_id] = determine_record_id_for_presenter

    presenter[:lock_sidebar] = @edit && @edit[:current]
    presenter[:osf_node] = x_node

    # Hide/show searchbox depending on if a list is showing
    presenter.set_visibility(!(@record || @in_a_form), :adv_searchbox_div)
    presenter[:clear_search_toggle] = clear_search_status

    # unset variable that was set in form_field_changed to prompt for changes when leaving the screen
    presenter.reset_changes

    render :json => presenter.for_render
  end

  # Build a Services explorer tree
  def build_svcs_tree
    TreeBuilderServices.new("svcs_tree", "svcs", @sb)
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
    @explorer
  end

  def get_session_data
    super
    @layout     = "services"
    @options    = session[:prov_options]
  end

  def set_session_data
    super
    session[:prov_options]   = @options if @options
  end

  menu_section :svc
  has_custom_buttons
end
