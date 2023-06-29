describe WorkflowRepositoryController do
  context 'with existing :embedded_workflow_configuration_script_source' do
    render_views

    before do
      EvmSpecHelper.assign_embedded_ansible_role
      login_as FactoryBot.create(:user_admin)
      # creating repository takes time, so we do it only once
      @repository = FactoryBot.create(:embedded_workflow_configuration_script_source)
    end

    describe "#show" do
      subject { get :show, :params => {:id => @repository.id} }

      it "render specific view and listnav" do
        is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
        is_expected.to have_http_status 200
      end
    end

    describe "#show_output" do
      subject { get :show, :params => {'id' => @repository.id, 'display' => 'output'} }

      it "render specific view" do
        is_expected.to render_template(:partial => "workflow_repository/_output")
        is_expected.to have_http_status 200
      end
    end

    describe "#show_list" do
      subject { get :show_list, :params => {} }

      it "render list of repositories with a toolbar and without listnav" do
        expect(ApplicationHelper::Toolbar::WorkflowRepositoriesCenter).to receive(:definition).and_call_original
        is_expected.to render_template(:partial => "layouts/_gtl")
        is_expected.not_to render_template(:partial => "layouts/listnav/_show_list")
        is_expected.to have_http_status 200
      end
    end

    describe "#show_association" do
      before do
        @tyeb = FactoryBot.create(:embedded_workflow, :configuration_script_source => @repository)
      end

      it "shows associated workflows" do
        get :show, :params => {:id => @repository.id, :display => 'workflows'}
        expect(response.body).to include("#{@repository.name} (All Workflows)")
        expect(response.status).to eq(200)
      end
    end
  end

  describe '#button' do
    before do
      controller.params = params
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

    context 'refreshing selected workflow repositories' do
      let(:params) { {:pressed => "workflow_repositories_reload"} }

      it 'calls show_list and render methods' do
        expect(controller).to receive(:show_list)
        expect(controller).to receive(:render)
        controller.send(:button)
      end
    end

    context 'refreshing an actual repository' do
      let(:params) { {:pressed => "workflow_repository_reload"} }

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

    context 'tagging one or more workflows from nested list' do
      let(:params) { {:pressed => "embedded_configuration_script_payload_tag"} }

      before do
        controller.instance_variable_set(:@display, "workflows")
      end

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(ManageIQ::Providers::Workflows::AutomationManager::Workflow)
        controller.send(:button)
      end
    end
  end

  describe '#toolbar' do
    let(:action) { 'show' }
    subject { controller.send(:toolbar) }

    before { controller.instance_variable_set(:@lastaction, action) }

    context 'displaying list of repositories' do
      let(:action) { 'show_list' }

      it 'returns proper toolbar filename' do
        expect(subject).to eq('workflow_repositories_center')
      end
    end

    context 'displaying summary screen of repository' do
      it 'returns proper toolbar filename' do
        expect(subject).to eq('workflow_repository_center')
      end
    end

    context 'displaying nested list of workflows' do
      before { controller.instance_variable_set(:@display, 'workflows') }

      it 'returns proper toolbar filename' do
        expect(subject).to eq('workflows_center')
      end
    end
  end

  describe '#show_searchbar?' do
    it 'renders true to allow displaying Search bar' do
      expect(controller.send(:show_searchbar?)).to eq(true)
    end
  end
end
