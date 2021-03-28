class ServiceController < ApplicationController
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericListMixin
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
    assert_privileges('service_view')

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
    else
      drop_breadcrumb(:name => _('Services'), :url => '/service/explorer') if @breadcrumbs.empty?
      @right_cell_text = _("Service \"%{name}\"") % {:name => @record.name}
      @no_checkboxes = true
      @items_per_page = ONE_MILLION
      @view, @pages = get_view(Vm, :parent => @record, :parent_method => :all_vms, :all_pages => true) # Get the records (into a view) and the paginator
    end

    # redirect_to(:action => 'show', :controller => @record.class.base_model.to_s.underscore, :id => @record.id)
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

  def service_edit
    assert_privileges("service_edit")
    case params[:button]
    when "cancel"
      service = find_record_with_rbac(Service, params[:id])
      add_flash(_("Edit of Service \"%{name}\" was cancelled by the user") % {:name => service.name})
    when "save"
      service = find_record_with_rbac(Service, params[:id])
      add_flash(_("Service \"%{name}\" was saved") % {:name => service.name})
    when "reset", nil # Reset or first time in
      checked = find_checked_items
      checked[0] = params[:id] if checked.blank? && params[:id]
      @service = find_record_with_rbac(Service, checked[0])
      @in_a_form = true
      return
    end
  end

  def service_reconfigure
    service = Service.find_by(:id => params[:id])
    service_template = service.service_template
    resource_action = service_template.resource_actions.find_by(:action => 'Reconfigure') if service_template

    @right_cell_text = _("Reconfigure Service \"%{name}\"") % {:name => service.name}
    dialog_locals = {:resource_action_id => resource_action.id, :target_id => service.id}
  end

  def service_form_fields
    assert_privileges('service_view')
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

  def reconfigure_form_fields
    assert_privileges('service_reconfigure')
    super
  end

  private

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

  def service_ownership
    assert_privileges('service_ownership')
    set_ownership
  end

  def service_tag_edit
    assert_privileges('service_tag')
    service_tag
  end

  def service_retire
    assert_privileges('service_retire')
    retirevms
  end

  def service_retire_now
    retirevms_now
  end

  def service_set_record_vars(svc)
    svc.name = params[:name] if params[:name]
    svc.description = params[:description] if params[:description]
  end

  def service_delete
    assert_privileges("service_delete")
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
  end

  def get_record_display_name(record)
    record.name
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

  # Overwriting from application controller
  #
  # FIXME:  Find a more graceful way of adding .with_aggregates to the @record
  def find_record_with_rbac(db, id)
    options = @find_with_aggregates ? { :named_scope => :with_aggregates } : {}
    super(db, id, options)
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
        {:title => _("My Services"), :url => controller_url},
      ],
      :record_info => (hide_record_info? ? {} : @service),
      :ancestry    => Service,
    }
  end

  def generic_objects_list?
    params[:display] == 'generic_objects'
  end

  def hide_record_info?
    generic_objects_list? && !params[:generic_object_id]
  end

  menu_section :svc
  feature_for_actions "service_view", *ADV_SEARCH_ACTIONS
  has_custom_buttons
  toolbar :service, :services
end
