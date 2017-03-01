class ApplicationHelper::Button::EmsContainerLaunchExternalLoggingSupport < ApplicationHelper::Button::GenericFeatureButton
  def initialize(view_context, view_binding, instance_data, props)
    props ||= {}
    props.store_path(:options, :feature, :external_logging_support)
    super(view_context, view_binding, instance_data, props)
  end

  def disabled?
    ems = @record.ext_management_system
    route_name = ems.external_logging_route_name
    disabled = !visible? || ContainerRoute.find_by(:name   => route_name,
                                                   :ems_id => ems.id).blank?
    @error_message = _("A route named '#{route_name}' is configured to connect to the " \
                       "external logging server but it doesn't exist") if disabled
    disabled
  end
end
