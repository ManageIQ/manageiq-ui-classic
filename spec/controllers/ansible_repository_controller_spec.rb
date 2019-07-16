describe AnsibleRepositoryController do
  context 'with existing :embedded_ansible_configuration_script_source' do
    render_views

    before do
      EvmSpecHelper.assign_embedded_ansible_role
      login_as FactoryBot.create(:user_admin)
      # creating repository takes time, so we do it only once
      @repository = FactoryBot.create(:embedded_ansible_configuration_script_source)
    end

    describe "#show" do
      subject { get :show, :params => {:id => @repository.id} }

      it "render specific view and listnav" do
        is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
        is_expected.to render_template(:partial => "layouts/listnav/_ansible_repository")
        is_expected.to have_http_status 200
      end
    end

    describe "#show_output" do
      subject { get :show, :params => {'id' => @repository.id, 'display' => 'output'} }

      it "render specific view" do
        is_expected.to render_template(:partial => "ansible_repository/_output")
        is_expected.to have_http_status 200
      end
    end

    describe "#show_list" do
      subject { get :show_list, :params => {} }

      it "render list of repositories with a toolbar and listnav" do
        expect(ApplicationHelper::Toolbar::AnsibleRepositoriesCenter).to receive(:definition).and_call_original
        is_expected.to render_template(:partial => "layouts/_gtl")
        is_expected.to render_template(:partial => "layouts/listnav/_show_list")
        is_expected.to have_http_status 200
      end
    end

    describe "#show_association" do
      before do
        @playbook = FactoryBot.create(:embedded_playbook, :configuration_script_source => @repository)
      end

      it "shows associated playbooks" do
        get :show, :params => {:id => @repository.id, :display => 'playbooks'}
        expect(response.body).to include("#{@repository.name} (All Playbooks)")
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
