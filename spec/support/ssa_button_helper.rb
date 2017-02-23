module SSAButtonHelper
  extend RSpec::Mocks::ExampleMethods

  def self.create_server_role(server, role)
    server_role = FactoryGirl.create(
      :server_role,
      :name              => role.downcase,
      :description       => role,
      :max_concurrent    => 1,
      :external_failover => false,
      :role_scope        => "zone"
    )

    priority = AssignedServerRole::DEFAULT_PRIORITY
    FactoryGirl.create(
      :assigned_server_role,
      :miq_server_id  => server.id,
      :server_role_id => server_role.id,
      :active         => true,
      :priority       => priority
    )
  end

  def self.create_server_smart_roles
    @miq_server = MiqServer.my_server
    MiqServer::ServerSmartProxy::SMART_ROLES.each do |role|
      create_server_role(@miq_server, role)
    end
  end
end
