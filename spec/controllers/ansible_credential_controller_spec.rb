describe AnsibleCredentialController do
  include CompressedIds
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    #:ansible_credential
    @repository = FactoryGirl.create(:embedded_ansible_configuration_script_source)
    login_as FactoryGirl.create(:user_admin)
  end

  context "#show" do
    subject do
      get :show, :params => {:id => @repository.id}
    end
    render_views
    it "render specific repostitory" do
      is_expected.to have_http_status 200
    end

    it "renders correct template" do
      is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
    end
  end

  context "#showList" do
    subject do
      get :show_list, :params => {}
    end

    it "render list of repositories" do
      is_expected.to have_http_status 200
      #is_expected.to render_template(:partial => "pxe_server_details", :locals => {:action_url => "pxe_server_list"})
    end

    it "renders correct template" do
      is_expected.to render_template(:layout => "layouts/application")
    end
  end
end
