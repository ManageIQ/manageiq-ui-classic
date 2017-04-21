describe AnsibleRepositoryController do
  include CompressedIds

  before do
    @repository = FactoryGirl.create(:embedded_ansible_configuration_script_source)
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryGirl.create(:user_admin)
  end

  context "show" do
    subject do
      get :show, :params => {:id => @repository.id}
    end
    render_views
    it "return correct http response code" do
      is_expected.to have_http_status 200
    end
    it "render view for specific repostitory" do
      is_expected.to render_template(:partial => "layouts/extual_groups_generic")
    end
  end

  context "showList" do
    subject do
      get :show_list, :params => {}
    end
    render_views
    it "return correct http response code" do
      is_expected.to have_http_status 200
    end
    it "render view for list of repositories" do
      is_expected.to render_template(:partial => "layouts/gtl")
    end
  end
end
