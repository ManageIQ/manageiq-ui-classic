describe AnsiblePlaybookController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryBot.create(:user_admin)
  end

  describe "#show" do
    let(:playbook) { FactoryBot.create(:embedded_playbook) }
    subject { get :show, :params => {:id => playbook.id} }
    render_views

    it "renders correct template and listnav" do
      is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
      is_expected.to render_template(:partial => "layouts/listnav/_ansible_playbook")
      is_expected.to have_http_status 200
    end

    it "displays tags" do
      get :show, :params => {:id => playbook.id}
      expect(response.body).to include("Smart Management")
    end
  end

  describe "#show_list" do
    subject { get :show_list }
    render_views

    it "renders correct template and listnav" do
      is_expected.to render_template(:partial => "layouts/_gtl")
      is_expected.to render_template(:partial => "layouts/listnav/_show_list")
      is_expected.to have_http_status 200
    end

    it 'renders the correct toolbar' do
      expect(ApplicationHelper::Toolbar::AnsiblePlaybooksCenter).to receive(:definition).and_call_original
      post :show_list
    end
  end

  describe "#button" do
    before do
      controller.params = params
    end

    context 'tagging one or more playbooks' do
      let(:params) { {:pressed => "embedded_configuration_script_payload_tag"} }

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(controller.class.model)
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

    context 'displaying list of playbooks' do
      let(:action) { 'show_list' }

      it 'returns proper toolbar filename' do
        expect(subject).to eq('ansible_playbooks_center')
      end
    end

    context 'displaying summary screen of a playbook' do
      it 'returns proper toolbar filename' do
        expect(subject).to eq('ansible_playbook_center')
      end
    end
  end
end
