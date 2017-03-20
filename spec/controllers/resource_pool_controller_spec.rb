describe ResourcePoolController do
  describe "#button" do
    # TODO: Test RPs contained in RPs

    let!(:user) { stub_user(:features => :all) }

    let(:pool) { FactoryGirl.create(:resource_pool) }

    it "handles when resource_pool_tag" do
      expect(controller).to receive(:tag).with(ResourcePool).and_call_original
      post :button, :params => {:pressed => "resource_pool_tag", :id => pool.id}
      expect(assigns(:flash_array)).to be_nil
    end

    it 'handles when resource_pool_delete' do
      expect(controller).to receive(:handle_resource_pool_delete)
      post :button, :params => {:pressed => "resource_pool_delete", :id => pool.id}
    end

    # Presses handled:
    # vm_right_size
    # vm_migrate
    # vm_retire
    # vm_protect
    # vm_tag
    # miq_template_protect
    # miq_template_tag

    include_examples :host_vm_button_examples
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      @resource_pool = FactoryGirl.create(:resource_pool)
    end

    let(:url_params) { {} }

    subject { get :show, :params => { :id => @resource_pool.id }.merge(url_params) }

    context "main" do
      it "renders" do
        expect(subject).to have_http_status(200)
        expect(subject).to render_template("resource_pool/show")
      end
    end

    context "All VMs - Tree View" do
      render_views
      let(:url_params) { { :display => "descendant_vms" } }
      it "renders" do
        expect(subject).to have_http_status(200)
        expect(subject).to render_template(:partial => "layouts/_tree")
      end
    end

    context "Direct VMs" do
      let(:url_params) { { :display => "vms" } }
      it "renders" do
        expect(subject).to have_http_status(200)
      end
    end

    context "All VMs" do
      let(:url_params) { { :display => "all_vms" } }
      it "renders" do
        expect(subject).to have_http_status(200)
      end
    end

    context "Nested Resource Pools" do
      let(:url_params) { { :display => "resource_pools"} }
      it "renders" do
        expect(subject).to have_http_status(200)
      end
    end
  end
end
