describe AnsiblePlaybookController do

  include CompressedIds

  before do
    @playbook = FactoryGirl.create(:embedded_playbook)
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryGirl.create(:user_admin)
  end

  context "#show" do
    #let(:playbook) { FactoryGirl.create(:embedded_playbook) }
    subject do
      get :show, :params => {:id => @playbook.id}
    end
    render_views
    it "returns status 200" do
      is_expected.to have_http_status 200
    end

    it "renders correct template" do
      is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
    end
  end

  context "#show_list" do
    subject do
      get :show_list, :params => {}
    end

    it "returns status 200" do
      is_expected.to have_http_status 200
    end

    it "renders correct template" do
      is_expected.to render_template(:layout => "layouts/application")
    end
  end

end
