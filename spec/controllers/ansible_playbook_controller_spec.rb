describe AnsiblePlaybookController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryGirl.create(:user_admin)
  end

  describe "#show" do
    let(:playbook) { FactoryGirl.create(:embedded_playbook) }
    subject { get :show, :params => {:id => playbook.id} }
    render_views

    it "returns status 200" do
      is_expected.to have_http_status 200
    end

    it "renders correct template" do
      is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
    end

    it "displays tags" do
      get :show, :params => {:id => playbook.id}
      expect(response.body).to include("Smart Management")
    end
  end

  describe "#show_list" do
    subject { get :show_list }
    render_views

    it "returns status 200" do
      is_expected.to have_http_status 200
    end

    it "renders correct template" do
      is_expected.to render_template(:partial => "layouts/_gtl")
    end
  end

  describe "#button" do
    before do
      controller.instance_variable_set(:@_params, params)
    end

    context 'tagging one or more playbooks' do
      let(:params) { {:pressed => "embedded_configuration_script_payload_tag"} }

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(controller.class.model)
        controller.send(:button)
      end
    end
  end
end
