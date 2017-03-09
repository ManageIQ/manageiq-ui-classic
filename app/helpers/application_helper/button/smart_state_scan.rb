class ApplicationHelper::Button::SmartStateScan < ApplicationHelper::Button::Basic
  needs :@record

  def check_smart_roles
    my_zone = MiqServer.my_server.my_zone
    MiqServer::ServerSmartProxy::SMART_ROLES.each do |role|
      unless MiqServer.all.any? { |s| s.has_active_role?(role) && (s.my_zone == my_zone) }
        @error_message = _("There is no server with the #{role} role enabled")
      end
    end
  end

  def disabled?
    check_smart_roles
    @error_message.present?
  end
end
