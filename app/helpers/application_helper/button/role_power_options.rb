class ApplicationHelper::Button::RolePowerOptions < ApplicationHelper::Button::Basic
  needs :@record, :@sb

  def visible?
    @view_context.x_active_tree == :diagnostics_tree &&
      %w[diagnostics_roles_servers diagnostics_servers_roles].include?(@sb[:active_tab]) &&
      @record.instance_of?(AssignedServerRole) &&
      @record.miq_server.started?
  end
end
