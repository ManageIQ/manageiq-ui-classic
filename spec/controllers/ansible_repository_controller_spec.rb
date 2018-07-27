describe AnsibleRepositoryController do
  before do
    EvmSpecHelper.assign_embedded_ansible_role
    login_as FactoryGirl.create(:user_admin)
  end

  describe "#show" do
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

  describe "#show_output" do
    let(:repository) { FactoryGirl.create(:embedded_ansible_configuration_script_source) }

    subject { get :show, :params => {'id' => repository.id, 'display' => 'output'} }
    render_views

    it "return correct http response code" do
      is_expected.to have_http_status 200
    end

    it "show repository last refresh output" do
      is_expected.to render_template(:partial => "ansible_repository/_output")
    end
  end

  describe "#show_list" do
    let(:repository) { FactoryGirl.create(:embedded_ansible_configuration_script_source) }
    subject { get :show_list, :params => {} }
    render_views

    it "return correct http response code" do
      is_expected.to have_http_status 200
    end

    it "render view for list of repositories" do
      is_expected.to render_template(:partial => "layouts/_gtl")
    end

    it 'renders the correct toolbar' do
      expect(ApplicationHelper::Toolbar::AnsibleRepositoriesCenter).to receive(:definition).and_call_original
      post :show_list
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

      it 'calls show and render methods' do
        expect(controller).to receive(:show)
        expect(controller).to receive(:render)
        controller.send(:button)
      end
    end

    context 'tagging one or more repositories' do
      let(:params) { {:pressed => "ansible_repository_tag"} }

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(controller.class.model)
        controller.send(:button)
      end
    end

    context 'tagging one or more playbooks from nested list' do
      let(:params) { {:pressed => "embedded_configuration_script_payload_tag"} }

      before do
        controller.instance_variable_set(:@display, "playbooks")
      end

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook)
        controller.send(:button)
      end
    end
  end

  describe '#toolbar' do
    let(:action) { 'show' }
    subject { controller.send(:toolbar) }

    before do
      controller.instance_variable_set(:@lastaction, action)
    end

    context 'displaying list of repositories' do
      let(:action) { 'show_list' }

      it 'returns proper toolbar filename' do
        expect(subject).to eq('ansible_repositories_center')
      end
    end

    context 'displaying summary screen of repository' do
      it 'returns proper toolbar filename' do
        expect(subject).to eq('ansible_repository_center')
      end
    end

    context 'displaying nested list of playbooks' do
      before do
        controller.instance_variable_set(:@display, 'playbooks')
      end

      it 'returns proper toolbar filename' do
        expect(subject).to eq('ansible_playbooks_center')
      end
    end
  end
end
