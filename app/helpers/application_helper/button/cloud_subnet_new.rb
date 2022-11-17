class ApplicationHelper::Button::CloudSubnetNew < ApplicationHelper::Button::ButtonNewDiscover
  def calculate_properties
    super
    if disabled?
      self[:title] = _("No cloud providers support creating cloud subnets.")
    end
  end

  def role_allows_feature?
    super && role_allows?(:feature => 'ems_network_show_list') && role_allows?(:feature => 'cloud_tenant_show_list') && role_allows?(:feature => 'cloud_network_show_list')
  end

  # disable button if no active providers support create action
  def disabled?
    ::EmsNetwork.all.none? { |ems| CloudSubnet.class_by_ems(ems)&.supports_create? }
  end
end
