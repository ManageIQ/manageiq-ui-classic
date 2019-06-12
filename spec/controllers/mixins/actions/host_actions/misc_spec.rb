describe Mixins::Actions::HostActions::Misc do
  describe "#host_button_operation" do
    let(:controller) do
      return HostController.new
    end
    let(:admin_user) { FactoryBot.create(:user, :role => "super_administrator") }
    let!(:host) { FactoryBot.create(:host) }

    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      login_as admin_user
      allow(User).to receive(:current_user).and_return(admin_user)
      allow(controller).to receive(:process_hosts).with([host.id], 'refresh_ems', 'Refresh')
      controller.params = {:id => Host.all.ids}
    end

    it "tests that find_records_with_rbac is called and does not fail" do
      expect(controller).to receive(:find_records_with_rbac).with(Host, Host.all.ids).and_return(Host.all)
      controller.send(:host_button_operation, 'refresh_ems', _('Refresh'))
    end
  end
end
