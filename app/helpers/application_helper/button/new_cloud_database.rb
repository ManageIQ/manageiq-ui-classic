class ApplicationHelper::Button::NewCloudDatabase < ApplicationHelper::Button::ButtonNewDiscover
  def supports_button_action?
    Rbac::Filterer.filtered(CloudDatabase.providers_supporting(:create)).any?
  end

  def disabled?
    @error_message = _("No cloud provider supports creating cloud databases.") unless supports_button_action?
    super || @error_message.present?
  end
end
