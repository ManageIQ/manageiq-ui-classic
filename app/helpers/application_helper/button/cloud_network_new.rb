class ApplicationHelper::Button::CloudNetworkNew < ApplicationHelper::Button::ButtonNewDiscover
  def supports_button_action?
    ::EmsNetwork.all.any? { |ems| CloudNetwork.class_by_ems(ems).supports_create? }
  end

  def role_allows_feature?
    role_allows?(:feature => 'ems_network_show_list')
  end

  def disabled?
    @error_message = _("No cloud providers support creating cloud networks.") unless supports_button_action?
    super || @error_message.present?
  end
end
