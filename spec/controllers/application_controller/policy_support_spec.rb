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

  describe '#policy_sim_cancel' do
    before do
      allow(controller).to receive(:flash_to_session).and_call_original
      allow(controller).to receive(:previous_breadcrumb_url)
      allow(controller).to receive(:redirect_to)
    end

    it 'calls redirect_to method' do
      expect(controller).to receive(:redirect_to)
      controller.send(:policy_sim_cancel)
    end

    it 'adds the message to flash array' do
      flash_msg = 'Edit policy simulation was cancelled by the user'
      expect(controller).to receive(:flash_to_session).with(flash_msg)
      controller.send(:policy_sim_cancel)
      expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => flash_msg, :level => :success}])
    end
  end
end
