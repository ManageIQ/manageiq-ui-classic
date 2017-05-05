class ApplicationHelper::Button::EmbeddedAnsible < ApplicationHelper::Button::Basic
  def disabled?
    if ManageIQ::Providers::EmbeddedAnsible::Provider.count != 1 ||
       ManageIQ::Providers::EmbeddedAnsible::AutomationManager.first.try(:last_refresh_status) != "success"
      @error_message = _("Embedded Ansible Role is not enabled.")
    end
    @error_message.present?
  end
end
