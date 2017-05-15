class ApplicationHelper::Button::EmbeddedAnsible < ApplicationHelper::Button::Basic
  def disabled?
    if !MiqRegion.my_region.role_active?('embedded_ansible') ||
       ManageIQ::Providers::EmbeddedAnsible::Provider.count <= 0
      @error_message = _("Embedded Ansible Role is not enabled.")
    end
    @error_message.present?
  end
end
