shared_examples_for 'a smart state scan button' do
  let(:smartproxy_role) { ServerRole.find_by(:name => 'smartproxy') }
  let(:smartstate_role) { ServerRole.find_by(:name => 'smartstate') }

  describe "in my zone" do
    let(:server) { MiqServer.my_server }
    context "both roles enabled" do
      before do
        FactoryBot.create(:assigned_server_role, :miq_server => server, :server_role => smartproxy_role, :active => true)
        FactoryBot.create(:assigned_server_role, :miq_server => server, :server_role => smartstate_role, :active => true)
        button.calculate_properties
      end

      it_behaves_like 'an enabled button'
    end

    context "only smartproxy role enabled" do
      before do
        FactoryBot.create(:assigned_server_role, :miq_server => server, :server_role => smartproxy_role, :active => true)
        button.calculate_properties
      end

      it_behaves_like 'a disabled button', "There is no server with the smartstate role enabled"
    end

    context "only smartstate role enabled" do
      before do
        FactoryBot.create(:assigned_server_role, :miq_server => server, :server_role => smartstate_role, :active => true)
        button.calculate_properties
      end

      it_behaves_like 'a disabled button', "There is no server with the smartproxy role enabled"
    end
  end

  describe "only enabled in another zone" do
    let(:server) { FactoryBot.create(:miq_server, :zone => FactoryBot.create(:zone)) }

    before do
      FactoryBot.create(:assigned_server_role, :miq_server => server, :server_role => smartproxy_role, :active => true)
      FactoryBot.create(:assigned_server_role, :miq_server => server, :server_role => smartstate_role, :active => true)
      button.calculate_properties
    end

    it_behaves_like 'a disabled button', "There is no server with the #{MiqServer::ServerSmartProxy::SMART_ROLES.last} role enabled"
  end
end
