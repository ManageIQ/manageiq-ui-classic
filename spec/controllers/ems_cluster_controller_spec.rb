describe EmsClusterController do
  let(:vm) { FactoryGirl.create(:vm_vmware) }
  let!(:user) { stub_user(:features => :all) }

  describe "#button" do
    # FIXME: Test power buttons
    include_examples :host_vm_button_examples
    include_examples :ems_cluster_button_examples

    it 'handles custom_buttons' do
      expect(controller).to receive(:custom_buttons).and_call_original
      post :button, :params => { :pressed => "custom_button" }
      expect(assigns(:flash_array)).to be_nil
    end

    it 'handles common_drift' do
      expect(controller).to receive(:drift_analysis).and_call_original
      post :button, :params => { :pressed => "common_drift" }
      expect(assigns(:flash_array)).to be_nil
    end
  end

  describe "#show" do
    let(:cluster) { FactoryGirl.create(:ems_cluster) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    subject do
      get :show, :params => {:id => cluster.id}
    end

    render_views

    it "renders show" do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/listnav/_ems_cluster")
    end
  end

  include_examples '#download_summary_pdf', :ems_cluster

  it_behaves_like "controller with custom buttons"
end
