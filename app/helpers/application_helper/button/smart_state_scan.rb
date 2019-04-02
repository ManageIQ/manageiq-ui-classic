class ApplicationHelper::Button::SmartStateScan < ApplicationHelper::Button::Basic
  def check_smart_roles
    my_zone = MiqServer.my_server.my_zone
    MiqServer::ServerSmartProxy::SMART_ROLES.each do |role|
      next if MiqServer.all.any? do |s|
        s.has_active_role?(role) &&
        s.my_zone == (@record.respond_to?(:zone) ? @record.zone : my_zone)
      end

      @error_message = _("There is no server with the %{role_name} role enabled") %
                       {:role_name => role}
    end
  end

  def disabled?
    check_smart_roles
    @error_message.present?
  end
end
