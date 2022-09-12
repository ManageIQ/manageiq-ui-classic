class ApplicationHelper::Button::SecurityPolicyNew < ApplicationHelper::Button::ButtonNewDiscover
  def supports_button_action?
    ::EmsNetwork.all.any? { |ems| SecurityPolicy.class_by_ems(ems)&.supports?(:create) }
  end

  def role_allows_feature?
    super && role_allows?(:feature => 'ems_network_show_list') && role_allows?(:feature => 'security_policy_show_list')
  end

  def disabled?
    @error_message = _("No cloud providers support creating security policies.") unless supports_button_action?
    super || @error_message.present?
  end
end
