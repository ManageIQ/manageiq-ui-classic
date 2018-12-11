describe ApplicationController do
  describe "#assign_policies" do
    let(:admin_user) { FactoryBot.create(:user, :role => "super_administrator") }
    let(:host)       { FactoryBot.create(:host) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone

      login_as admin_user
      allow(User).to receive(:current_user).and_return(admin_user)
      allow(controller).to receive(:assert_privileges)
      controller.instance_variable_set(:@_params, :id=> host.id)
    end

    it "redirects to protect" do
      expect(controller).to receive(:javascript_redirect).with(:action => 'protect', :db => Host)
      controller.send(:assign_policies, Host)
    end
  end
end
