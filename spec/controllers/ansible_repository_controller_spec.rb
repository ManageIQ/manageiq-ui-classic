describe AnsibleRepositoryController do
  include CompressedIds

  before do
    EvmSpecHelper.create_guid_miq_server_zone
    @repository = FactoryGirl.create(:embedded_ansible_configuration_script_source)

    login_as FactoryGirl.create(:user_admin)
  end

  context "show" do
    subject do
      get :show, :params => {:id => @repository.id}
    end

    it "render specific repostitory" do
      is_expected.to have_http_status 200
    end
  end

  context "showList" do
    subject do
      get :show_list
    end

    it "render list of repositories" do
      is_expected.to have_http_status 200
    end
  end
end
