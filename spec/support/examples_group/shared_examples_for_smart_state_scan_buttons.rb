shared_examples_for 'a smart state scan button' do
  let(:my_zone) { MiqServer.my_server.zone }
  let(:server) { FactoryGirl.create(:miq_server, :zone => my_zone, :active_roles => roles) }
  let(:smartproxy_role) { FactoryGirl.create(:server_role, :name => 'smartproxy') }
  let(:smartscan_role) { FactoryGirl.create(:server_role, :name => 'smartstate') }

  describe '#calculate_properties' do
    before do
      MiqServer.seed
      server
      button.calculate_properties
    end

    MiqServer::ServerSmartProxy::SMART_ROLES.each do |role|
      context "when there is a server with enabled #{role} role" do
        let(:roles) { [smartproxy_role, smartscan_role] }
        let(:active_role) { true }
        it_behaves_like 'an enabled button'
      end
      context "when there is no server with enabled #{role} role" do
        let(:roles) { [role == 'smartproxy' ? smartscan_role : smartproxy_role] }
        let(:active_role) { false }
        it_behaves_like 'a disabled button', "There is no server with the #{role} role enabled"
      end
    end
  end
end
