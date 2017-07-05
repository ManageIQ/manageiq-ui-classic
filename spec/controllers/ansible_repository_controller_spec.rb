describe AnsibleRepositoryController do
  include CompressedIds

  before do
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryGirl.create(:user_admin)
  end

  context "show" do
    let(:repository) { FactoryGirl.create(:embedded_ansible_configuration_script_source) }
    subject { get :show, :params => {:id => repository.id} }
    render_views

    it "return correct http response code" do
      is_expected.to have_http_status 200
    end

    it "render view for specific repository" do
      is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
    end
  end

  context "showList" do
    let(:repository) { FactoryGirl.create(:embedded_ansible_configuration_script_source) }
    subject { get :show_list, :params => {} }
    render_views

    it "return correct http response code" do
      is_expected.to have_http_status 200
    end

    it "render view for list of repositories" do
      is_expected.to render_template(:partial => "layouts/_gtl")
    end
  end

  context "#show_association" do
    render_views

    before(:each) do
      @repository = FactoryGirl.create(:embedded_ansible_configuration_script_source, :name => "Test Repository")
      @playbook = FactoryGirl.create(:embedded_playbook, :name => 'playbook_name', :configuration_script_source => @repository)
    end

    it "shows associated playbooks" do
      get :show, :params => {:id => @repository.id, :display => 'playbooks'}
      expect(response.status).to eq(200)
      expect(response.body).to include("Test Repository (All Playbooks)")
    end
  end
end
