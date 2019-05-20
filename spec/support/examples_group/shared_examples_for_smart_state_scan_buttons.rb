shared_examples_for 'a smart state scan button' do
  let(:my_zone) { MiqServer.my_server.zone }
  let(:server) { FactoryBot.create(:miq_server, :zone => my_zone, :active_roles => roles) }
  let(:smartproxy_role) { ServerRole.find_by(:name => 'smartproxy') }
  let(:smartscan_role) { ServerRole.find_by(:name => 'smartstate') }

  describe '#calculate_properties' do
    before do
      EvmSpecHelper.local_guid_miq_server_zone
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

    context "when there is no server in the zone" do
      let(:roles) { [smartproxy_role, smartscan_role] }
      let(:active_role) { true }
      let(:zone1) { FactoryBot.create(:zone) }
      let(:server) { FactoryBot.create(:miq_server, :zone => zone1, :active_roles => roles) }
      it_behaves_like 'a disabled button', "There is no server with the #{MiqServer::ServerSmartProxy::SMART_ROLES.last} role enabled"
    end
  end
end
