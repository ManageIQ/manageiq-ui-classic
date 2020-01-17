describe ResourcePoolController do
  describe "#button" do
    before { controller.instance_variable_set(:@display, "vms") }

    it "when VM Right Size Recommendations is pressed" do
      controller.params = {:pressed => "vm_right_size"}
      expect(controller).to receive(:vm_right_size)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Migrate is pressed" do
      controller.params = {:pressed => "vm_migrate"}
      controller.instance_variable_set(:@refresh_partial, "layouts/gtl")
      expect(controller).to receive(:prov_redirect).with("migrate")
      expect(controller).to receive(:render)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Manage Policies is pressed" do
      controller.params = {:pressed => "vm_protect"}
      expect(controller).to receive(:assign_policies).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when MiqTemplate Manage Policies is pressed" do
      controller.params = {:pressed => "miq_template_protect"}
      expect(controller).to receive(:assign_policies).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Tag is pressed" do
      controller.params = {:pressed => "vm_tag"}
      expect(controller).to receive(:tag).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when MiqTemplate Tag is pressed" do
      controller.params = {:pressed => "miq_template_tag"}
      expect(controller).to receive(:tag).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it 'returns proper record class' do
      expect(controller.send(:record_class)).to eq(ResourcePool)
    end

    context 'VMs displayed through Relationships of a Resource Pool' do
      %w[all_vms vms].each do |display|
        before { controller.params = {:display => display} }

        it 'returns proper record class' do
          expect(controller.send(:record_class)).to eq(VmOrTemplate)
        end
      end
    end

    context 'Check Compliance action on VMs of a Resource Pool' do
      let(:vm) { FactoryBot.create(:vm_vmware) }
      let(:resource_pool) { FactoryBot.create(:resource_pool) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:drop_breadcrumb)
        allow(controller).to receive(:performed?)
        allow(controller).to receive(:render)
        controller.params = {:miq_grid_checks => vm.id.to_s, :pressed => 'vm_check_compliance', :id => resource_pool.id.to_s, :controller => 'resource_pool'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          EvmSpecHelper.create_guid_miq_server_zone
          vm.add_policy(policy)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end

      it 'calls check_compliance_vms' do
        expect(controller).to receive(:check_compliance_vms)
        controller.send(:button)
      end
    end

    context 'reconfigure VMs' do
      before { controller.params = {:pressed => 'vm_reconfigure'} }

      it 'calls vm_reconfigure' do
        expect(controller).to receive(:vm_reconfigure)
        controller.send(:button)
      end
    end

    context 'Extract Running Processes for selected VMs' do
      let(:vm) { FactoryBot.create(:vm_vmware) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:show)
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:render)
        controller.params = {:pressed => 'vm_collect_running_processes', :miq_grid_checks => vm.id.to_s}
      end

      it 'calls getprocessesvms' do
        expect(controller).to receive(:getprocessesvms)
        controller.send(:button)
      end

      it 'sets error flash message' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Collect Running Processes action does not apply to selected items', :level => :error}])
      end
    end

    context 'Compare selected VMs' do
      before { controller.params = {:pressed => 'vm_compare'} }

      it 'calls comparemiq' do
        expect(controller).to receive(:comparemiq)
        controller.send(:button)
      end
    end

    context 'Edit selected VM' do
      before do
        allow(controller).to receive(:render_or_redirect_partial)
        controller.params = {:pressed => 'vm_edit'}
      end

      it 'calls edit_record' do
        expect(controller).to receive(:edit_record)
        controller.send(:button)
      end
    end

    context 'Rename selected VM' do
      before do
        allow(controller).to receive(:performed?).and_return(true)
        controller.params = {:pressed => 'vm_rename'}
      end

      it 'calls vm_rename' do
        expect(controller).to receive(:vm_rename)
        controller.send(:button)
      end
    end

    context 'Set ownership for selected VMs' do
      before { controller.params = {:pressed => 'vm_ownership'} }

      it 'calls set_ownership' do
        expect(controller).to receive(:set_ownership)
        controller.send(:button)
      end
    end

    context 'Policy Simulation for selected VMs' do
      before { controller.params = {:pressed => 'vm_policy_sim'} }

      it 'calls polsimvms' do
        expect(controller).to receive(:polsimvms)
        controller.send(:button)
      end
    end

    context 'Provision VMs' do
      before do
        allow(controller).to receive(:render_or_redirect_partial)
        controller.params = {:pressed => 'vm_miq_request_new'}
      end

      it 'calls prov_redirect' do
        expect(controller).to receive(:prov_redirect).with(no_args)
        controller.send(:button)
      end
    end

    context 'Clone VMs' do
      before do
        allow(controller).to receive(:render_or_redirect_partial)
        controller.params = {:pressed => 'vm_clone'}
      end

      it 'calls prov_redirect with appropriate argument' do
        expect(controller).to receive(:prov_redirect).with('clone')
        controller.send(:button)
      end
    end

    context 'Publish VM to a Template' do
      before do
        allow(controller).to receive(:render_or_redirect_partial)
        controller.params = {:pressed => 'vm_publish'}
      end

      it 'calls prov_redirect with appropriate argument' do
        expect(controller).to receive(:prov_redirect).with('publish')
        controller.send(:button)
      end
    end

    context 'Retire VMs' do
      before do
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:show)
        controller.params = {:pressed => 'vm_retire_now'}
      end

      it 'calls retirevms_now' do
        expect(controller).to receive(:retirevms_now)
        controller.send(:button)
      end
    end

    context 'Shutdown Guest of a VM' do
      before do
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:show)
        controller.params = {:pressed => 'vm_guest_shutdown'}
      end

      it 'calls guestshutdown' do
        expect(controller).to receive(:guestshutdown)
        controller.send(:button)
      end
    end

    context 'Restart Guest of a VM' do
      before do
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:show)
        controller.params = {:pressed => 'vm_guest_restart'}
      end

      it 'calls guestshutdown' do
        expect(controller).to receive(:guestreboot)
        controller.send(:button)
      end
    end

    %w[delete refresh reset retire scan start stop suspend].each do |action|
      context "#{action} for selected VMs displayed in a nested list" do
        before { controller.params = {:pressed => "vm_#{action}"} }

        it "calls #{action + 'vms'} method" do
          allow(controller).to receive(:show)
          allow(controller).to receive(:performed?).and_return(true)
          expect(controller).to receive((action + 'vms').to_sym)
          controller.send(:button)
          expect(controller.send(:flash_errors?)).not_to be_truthy
        end
      end
    end

    context 'deleting Resource Pool' do
      before do
        allow(controller).to receive(:performed?).and_return(true)
        controller.instance_variable_set(:@lastaction, 'show_list')
        controller.instance_variable_set(:@display, nil)
        controller.params = {:pressed => 'resource_pool_delete'}
      end

      it 'calls deleteresourcepools and replace_gtl_main_div' do
        expect(controller).to receive(:deleteresourcepools)
        expect(controller).to receive(:replace_gtl_main_div)
        controller.send(:button)
      end

      context 'default div to refresh' do
        before do
          allow(controller).to receive(:deleteresourcepools)
          allow(controller).to receive(:replace_gtl_main_div)
        end

        it 'sets @refresh_div to main div' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@refresh_div)).to eq('main_div')
        end
      end

      context 'nested list of Resource Pools' do
        before do
          allow(controller).to receive(:performed?).and_return(false)
          controller.instance_variable_set(:@display, 'resource_pools')
        end

        it 'calls deleteresourcepools and render_flash' do
          expect(controller).to receive(:deleteresourcepools)
          expect(controller).to receive(:render_flash)
          controller.send(:button)
        end
      end
    end

    context 'managing policies of Resource Pools' do
      before do
        controller.instance_variable_set(:@display, nil)
        controller.params = {:pressed => 'resource_pool_protect'}
      end

      it 'calls assign_policies' do
        expect(controller).to receive(:assign_policies).with(ResourcePool)
        controller.send(:button)
      end

      context 'default div to refresh' do
        before { allow(controller).to receive(:assign_policies) }

        it 'sets @refresh_div to main div' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@refresh_div)).to eq('main_div')
        end
      end
    end

    context 'tagging Resource Pool' do
      before do
        controller.instance_variable_set(:@display, nil)
        controller.params = {:pressed => 'resource_pool_tag'}
      end

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(ResourcePool)
        controller.send(:button)
      end
    end
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user, :features => "none")
      @resource_pool = FactoryBot.create(:resource_pool)
    end

    let(:url_params) { {} }

    subject { get :show, :params => { :id => @resource_pool.id }.merge(url_params) }

    context "main" do
      it "renders" do
        expect(subject).to have_http_status(200)
        expect(subject).to render_template("resource_pool/show")
      end
    end

    context "Direct VMs" do
      let(:url_params) { { :display => "vms" } }

      it "renders" do
        bypass_rescue
        expect(subject).to have_http_status(200)
      end
    end

    context "All VMs" do
      let(:url_params) { { :display => "all_vms" } }

      it "renders" do
        bypass_rescue
        expect(subject).to have_http_status(200)
      end
    end

    context "Nested Resource Pools" do
      let(:url_params) { { :display => "resource_pools"} }

      it "renders" do
        bypass_rescue
        expect(subject).to have_http_status(200)
      end
    end
  end
end
