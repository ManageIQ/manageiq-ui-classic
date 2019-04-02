module ApplicationHelper::Toolbar::ServerMixin
  def server_role_string_proc(message)
    proc do
      message % {
        :server_role_description => @record.server_role.description,
        :server_name             => @record.miq_server.name,
        :server_id               => @record.miq_server.id
      }
    end
  end
end
