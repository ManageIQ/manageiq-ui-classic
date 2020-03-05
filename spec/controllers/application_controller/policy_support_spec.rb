describe ApplicationController do
  describe "#assign_policies" do
    let(:admin_user) { FactoryBot.create(:user, :role => "super_administrator") }
    let(:host)       { FactoryBot.create(:host) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone

      login_as admin_user
      allow(User).to receive(:current_user).and_return(admin_user)
      allow(controller).to receive(:assert_privileges)
      controller.params = {:id=> host.id}
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

  describe '#policy_sim_build_screen' do
    before do
      allow(controller).to receive(:session).and_return(:tag_items => [vm], :tag_db => VmOrTemplate)
      controller.params = {:controller => vm_ctrl}
    end

    context 'VM policy simulation and non explorer screen' do
      let(:controller) { VmInfraController.new }
      let(:vm) { FactoryBot.create(:vm_vmware) }
      let(:vm_ctrl) { 'vm_infra' }

      it 'sets right cell text' do
        controller.send(:policy_sim_build_screen, [vm])
        expect(controller.instance_variable_get(:@right_cell_text)).to eq('Virtual Machine Policy Simulation')
      end
    end

    context 'Instance policy simulation and non explorer screen' do
      let(:controller) { VmCloudController.new }
      let(:vm) { FactoryBot.create(:vm_openstack, :ext_management_system => FactoryBot.create(:ems_openstack)) }
      let(:vm_ctrl) { 'vm_cloud' }

      it 'sets right cell text' do
        controller.send(:policy_sim_build_screen, [vm])
        expect(controller.instance_variable_get(:@right_cell_text)).to eq('Instance Policy Simulation')
      end
    end
  end

  describe '#policy_sim' do
    let(:vm) { FactoryBot.create(:vm_infra) }

    before do
      allow(controller).to receive(:drop_breadcrumb)
      allow(controller).to receive(:session).and_return(:tag_db => VmOrTemplate, :tag_items => [vm])
      controller.params = {:action => 'policy_sim', :continue => true, :controller => 'vm'}
    end

    it 'sets session[:edit] when going back to policy simulation, in non-explorer screen' do
      controller.send(:policy_sim)
      expect(controller.session).to include(:edit => {:pol_items => [vm]})
    end
  end

  describe '#protect' do
    before do
      allow(controller).to receive(:previous_breadcrumb_url)
      allow(controller).to receive(:redirect_to)
      allow(controller).to receive(:session).and_return(:edit => {})
      controller.instance_variable_set(:@sb, {})
      controller.params = {:button => 'cancel'}
    end

    it 'sets session[:flash_msgs] after canceling managing policies in non explorer screen' do
      controller.send(:protect)
      expect(controller.session[:flash_msgs]).to eq([{:message => 'Edit policy assignments was cancelled by the user', :level => :success}])
    end
  end
end
