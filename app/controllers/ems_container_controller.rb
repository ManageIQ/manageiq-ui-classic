class EmsContainerController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon # common methods for EmsInfra/Cloud/Container controllers
  include Mixins::EmsCommon::Angular
  include Mixins::GenericSessionMixin
  include Mixins::DashboardViewMixin
  include ContainersExternalLoggingSupportMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::ContainerManager
  end

  def self.table_name
    @table_name ||= "ems_container"
  end

  def show_list
    @showtype = "main"
    process_show_list(:gtl_dbname => 'emscontainer')
  end

  def show
    @breadcrumbs = [{:name => _('Containers Providers'), :url => '/ems_container/show_list'}]
    super
  end

  def ems_path(*args)
    ems_container_path(*args)
  end

  def new_ems_path
    new_ems_container_path
  end

  def ems_container_form_fields
    ems_form_fields
  end

  def update
    assert_privileges("#{permission_prefix}_edit")
    if params[:button] == "detect"
      update_ems_button_detect
    else
      super
    end
  end

  def create
    assert_privileges("#{permission_prefix}_new")
    if params[:button] == "detect"
      create_ems_button_detect
    else
      super
    end
  end

  def create_ems_button_detect
    ems = model.model_from_emstype(params[:emstype]).new
    update_ems_button_detect(ems)
  end

  def update_ems_button_detect(verify_ems = nil)
    route_type = if params[:current_tab] == "alerts"
                   "prometheus_alerts"
                 else
                   params[:metrics_selection]
                 end

    verify_ems ||= find_record_with_rbac(model, params[:id])
    set_ems_record_vars(verify_ems, :validate)
    @in_a_form = true

    begin
      raise "Route detection not applicable for provider type" unless verify_ems.respond_to?(:hostname_for_service)

      result = verify_ems.hostname_for_service(route_type)
      add_flash(_("Route Detection: success"))
    rescue StandardError => e
      $log.warn("MIQ(#{controller_name}_controller-#{action_name}): get_hostname_from_routes error: #{e.message}")
      add_flash(_("Route Detection: failure [%{details}]") % {:details => e.message}, :error)
    end

    render :json => {
      :message  => @flash_array.last[:message],
      :level    => @flash_array.last[:level],
      :hostname => result
    }
  end

  def retrieve_metrics_selection
    if @ems.connection_configurations.try(:prometheus)
      "prometheus"
    elsif @ems.connection_configurations.try(:hawkular)
      "hawkular"
    else
      "disabled"
    end
  end

  def retrieve_alerts_selection
    return "disabled" if @ems.connection_configurations.try(:prometheus_alerts).nil?

    "prometheus"
  end

  def retrieve_virtualization_selection
    @ems.connection_configurations.try(:kubevirt).nil? ? "disabled" : "kubevirt"
  end

  def restful?
    true
  end

  private

  def textual_group_list
    [%i[properties endpoints status miq_custom_attributes], %i[compliance relationships topology smart_management]]
  end
  helper_method :textual_group_list

  ############################
  # Special EmsCloud link builder for restful routes
  def show_link(ems, options = {})
    ems_path(ems.id, options)
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Providers"), :url => controller_url},
      ],
      :record_info => @ems,
    }.compact
  end

  menu_section :cnt

  has_custom_buttons
end
