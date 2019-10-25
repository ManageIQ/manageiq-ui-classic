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
