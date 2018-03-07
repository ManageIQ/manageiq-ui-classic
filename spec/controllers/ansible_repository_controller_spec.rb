describe AnsibleRepositoryController do
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

  describe "#show_association" do
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

    it 'reload button will stay on the nested list' do
      get :show, :params => {:id => @repository.id, :display => 'playbooks'}
      expect(response.status).to eq(200)
      post :button, :params => { :id => @repository.id, :pressed => 'ansible_repository_reload' }
      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => "layouts/_gtl")
    end
  end

  describe '#button' do
    before do
      controller.instance_variable_set(:@_params, params)
    end

    context 'editing an existing repository' do
      let(:params) { {:pressed => "embedded_configuration_script_source_edit", :miq_grid_checks => [123]} }

      it 'redirects to action edit' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'edit', :id => params[:miq_grid_checks])
        controller.send(:button)
      end
    end

    context 'adding a new repository' do
      let(:params) { {:pressed => "embedded_configuration_script_source_add"} }

      it 'redirects to action new' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'new')
        controller.send(:button)
      end
    end

    context 'deleting one or more repositories from inventory' do
      let(:params) { {:pressed => "embedded_configuration_script_source_delete"} }

      it 'calls delete_repositories method' do
        expect(controller).to receive(:delete_repositories)
        controller.send(:button)
      end
    end

    context 'refreshing selected ansible repositories' do
      let(:params) { {:pressed => "ansible_repositories_reload"} }

      it 'calls show_list and render methods' do
        expect(controller).to receive(:show_list)
        expect(controller).to receive(:render)
        controller.send(:button)
      end
    end

    context 'refreshing an actual repository' do
      let(:params) { {:pressed => "ansible_repository_reload"} }
      let(:display) { "main" }

      before do
        controller.instance_variable_set(:@display, display)
      end

      it 'calls show and render methods' do
        expect(controller).to receive(:show)
        expect(controller).to receive(:render)
        controller.send(:button)
        expect(controller.instance_variable_get(:@_params)[:display]).to eq(display)
      end
    end

    context 'tagging one or more repositories' do
      let(:params) { {:pressed => "ansible_repository_tag"} }

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(controller.class.model)
        controller.send(:button)
      end
    end
  end
end
