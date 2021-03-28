class ServiceController < ApplicationController
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericListMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::Actions::VmActions::Ownership

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    assert_privileges("service_show_list")
    process_show_list(:dbname => :service, :gtl_dbname => :service)
  end

  def button
    case params[:pressed]
    when 'service_tag'
      tag(self.class.model)
    when 'service_edit'
      javascript_redirect(:action => 'edit', :id => checked_item_id)
    when 'service_ownership'
      javascript_redirect(:action => 'ownership', :rec_ids => checked_or_params)
    when 'service_retire'
      service_retire
    when 'service_retire_now'
      service_retire_now
    end
  end

  def title
    _("My Services")
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

  def edit
    assert_privileges("service_edit")
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]
    @service = find_record_with_rbac(Service, checked[0])
    @in_a_form = true
    drop_breadcrumb(:name => _("Edit Service\"%{name}\"") % {:name => @service.name}, :url => "/service/edit/#{@service.id}")
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

  def service_ownership
    assert_privileges('service_ownership')
    params[:pressed] = 'service_ownership'
    set_ownership
  end

  def previous_breadcrumb_url
    action = @lastaction
    url_for_only_path(:action => action)
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
      header = _("Set Ownership for Service1")
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
      action = "edit"
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
  def find_record_with_rbac(service, record_id)
    options = @find_with_aggregates ? {:named_scope => :with_aggregates} : {}
    super(service, record_id, options)
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
      # :ancestry => Service,
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
