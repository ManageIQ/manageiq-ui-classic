class ApplicationHelper::Button::EmbeddedWorkflow < ApplicationHelper::Button::Basic
  def disabled?
    if Rbac.filtered(ManageIQ::Providers::Workflows::AutomationManager.all).empty?
      @error_message = _("User isn't allowed to use the Embedded Workflows provider.")
    end
  end
end
