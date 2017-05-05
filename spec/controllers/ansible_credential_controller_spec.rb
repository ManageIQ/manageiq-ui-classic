describe AnsibleCredentialController do
  include CompressedIds

  before do
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryGirl.create(:user_admin)
  end

  context "#show" do
    let(:machine_credential) { FactoryGirl.create(:embedded_ansible_scm_credential, :options=>{}) }
    subject { get :show, :params => {:id => machine_credential.id} }
    render_views
    it "returns status 200" do
      is_expected.to have_http_status 200
    end

    it "renders correct template" do
      is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
    end
  end

  context "#show_list" do
    subject { get :show_list, :params => {} }
    render_views

    it "returns status 200" do
      is_expected.to have_http_status 200
    end

    it "renders correct template" do
      is_expected.to render_template(:partial => "layouts/_gtl")
    end
  end
end
