class ApplicationHelper::Button::NetworkRouterNew < ApplicationHelper::Button::ButtonNewDiscover
  def calculate_properties
    super
    if disabled?
      self[:title] = _("No cloud providers support creating network routers.")
    end
  end

  def role_allows_feature?
    super && role_allows_all?('ems_network_show_list', 'cloud_tenant_show_list')
  end

  # disable button if no active providers support create action
  def disabled?
    ::EmsNetwork.all.none? { |ems| NetworkRouter.class_by_ems(ems).supports_create? }
  end
end
