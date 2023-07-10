describe WorkflowCredentialController do
  let(:workflows_enabled) { true }
  before { stub_settings_merge(:prototype => {:ems_workflows => {:enabled => workflows_enabled}}) }

  before do
    EvmSpecHelper.assign_embedded_ansible_role
    login_as FactoryBot.create(:user_admin)
  end

  describe "#show" do
    let(:machine_credential) { FactoryBot.create(:embedded_workflows_scm_credential, :options=>{}) }
    subject { get :show, :params => {:id => machine_credential.id} }
    render_views

    it "renders correct template and listnav" do
      is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
      is_expected.to have_http_status 200
    end
  end

  describe "#show_list" do
    subject { get :show_list, :params => {} }
    render_views

    it "renders correct template and does not render listnav" do
      is_expected.to render_template(:partial => "layouts/_gtl")
      is_expected.not_to render_template(:partial => "layouts/listnav/_show_list")
      is_expected.to have_http_status 200
    end

    it 'renders the correct toolbar' do
      expect(ApplicationHelper::Toolbar::WorkflowCredentialsCenter).to receive(:definition).and_call_original
      post :show_list
    end
  end

  describe '#button' do
    before do
      controller.params = params
    end

    context 'adding a new workflow credential' do
      let(:params) { {:pressed => "embedded_automation_manager_credentials_add"} }

      it 'redirects to action new' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'new')
        controller.send(:button)
      end
    end

    context 'editing one or more workflow credentials' do
      let(:params) { {:pressed => "embedded_automation_manager_credentials_edit"} }

      it 'redirects to action edit' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'edit', :id => params[:miq_grid_checks])
        controller.send(:button)
      end
    end

    context 'tagging one or more workflow credentials' do
      let(:params) { {:pressed => "ansible_credential_tag"} }

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(controller.class.model)
        controller.send(:button)
      end
    end

    context 'tagging one or more workflow repositories from nested list' do
      let(:params) { {:pressed => "workflow_repository_tag"} }

      before do
        controller.instance_variable_set(:@display, "repositories")
      end

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(ManageIQ::Providers::Workflows::AutomationManager::ConfigurationScriptSource)
        controller.send(:button)
      end
    end
  end

  describe '#toolbar' do
    let(:action) { 'show' }
    subject { controller.send(:toolbar) }

    before { controller.instance_variable_set(:@lastaction, action) }

    context 'displaying list of credentials' do
      let(:action) { 'show_list' }

      it 'returns proper toolbar filename' do
        expect(subject).to eq('workflow_credentials_center')
      end
    end

    context 'displaying summary screen of a credential' do
      it 'returns proper toolbar filename' do
        expect(subject).to eq('workflow_credential_center')
      end
    end

    context 'displaying nested list of repositories' do
      before { controller.instance_variable_set(:@display, 'repositories') }

      it 'returns proper toolbar filename' do
        expect(subject).to eq('workflow_repositories_center')
      end
    end
  end

  describe '#show_searchbar?' do
    it 'renders true to allow displaying Search bar' do
      expect(controller.send(:show_searchbar?)).to eq(true)
    end
  end
end
