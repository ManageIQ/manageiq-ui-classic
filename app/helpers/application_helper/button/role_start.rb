class ApplicationHelper::Button::RoleStart < ApplicationHelper::Button::RolePowerOptions
  needs :@record, :@sb

  def disabled?
    @error_message = if @record.instance_of?(AssignedServerRole)
                       if @record.active
                         _("This Role is already active on this Server")
                       elsif !@record.miq_server.started?
                         _("Only available Roles on active Servers can be started")
                       elsif @view_context.x_node != "root" && @record.server_role.regional_role?
                         _("This role can only be managed at the Region level")
                       end
                     end
    @error_message.present?
  end
end
