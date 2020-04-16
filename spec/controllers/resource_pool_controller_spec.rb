describe ResourcePoolController do
  context "#button" do
    before do
      controller.instance_variable_set(:@display, "vms")
    end

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

    it "when VM Retire is pressed" do
      controller.params = {:pressed => "vm_retire"}
      expect(controller).to receive(:retirevms).once
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

    context 'reconfigure VMs' do
      before do
        controller.instance_variable_set(:@display, 'vms')
        controller.params = {:pressed => 'vm_reconfigure'}
      end

      it 'calls vm_reconfigure' do
        expect(controller).to receive(:vm_reconfigure)
        controller.send(:button)
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
