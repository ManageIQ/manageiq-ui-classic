require 'shared/helpers/application_helper/buttons/basic'

shared_context 'ApplicationHelper::Button::Scan#calculate_properties' do
  let(:my_zone) { MiqServer.my_server.zone }
  let(:setup_server) { FactoryGirl.create(:miq_server, :zone => my_zone, :active_roles => roles) }
  let(:smartproxy_role) { FactoryGirl.create(:server_role, :name => 'smartproxy') }
  let(:smartscan_role) { FactoryGirl.create(:server_role, :name => 'smartstate') }

  MiqServer::ServerSmartProxy::SMART_ROLES.each do |role|
    context "when there is a server with enabled #{role} role" do
      let(:roles) { [smartproxy_role, smartscan_role] }
      let(:active_role) { true }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
    context "when there is no server with enabled #{role} role" do
      let(:roles) { [role == 'smartproxy' ? smartscan_role : smartproxy_role] }
      let(:active_role) { false }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => "There is no server with the #{role} role enabled"
    end
  end
end
