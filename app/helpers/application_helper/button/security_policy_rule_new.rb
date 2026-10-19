class ApplicationHelper::Button::SecurityPolicyRuleNew < ApplicationHelper::Button::ButtonNewDiscover
  def supports_button_action?
    Rbac::Filterer.filtered(SecurityPolicyRule.providers_supporting(:create)).any?
  end

  def role_allows_feature?
    super && role_allows?(:feature => 'ems_network_show_list') && role_allows?(:feature => 'security_policy_rule_show_list')
  end

  def disabled?
    @error_message = _("No cloud providers support creating security policy rules.") unless supports_button_action?
    super || @error_message.present?
  end
end
