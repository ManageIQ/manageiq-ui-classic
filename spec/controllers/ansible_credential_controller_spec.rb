describe AnsibleCredentialController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryGirl.create(:user_admin)
  end

  describe "#show" do
    let(:machine_credential) { FactoryGirl.create(:embedded_ansible_scm_credential, :options=>{}) }
    subject { get :show, :params => {:id => machine_credential.id} }
    render_views
    it "returns status 200" do
      is_expected.to have_http_status 200
    end

    it "renders correct template" do
      is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
    end
  end

  describe "#show_list" do
    subject { get :show_list, :params => {} }
    render_views

    it "returns status 200" do
      is_expected.to have_http_status 200
    end

    it "renders correct template" do
      is_expected.to render_template(:partial => "layouts/_gtl")
    end
  end

  describe '#button' do
    before do
      controller.instance_variable_set(:@_params, params)
    end

    context 'adding a new ansible credential' do
      let(:params) { {:pressed => "embedded_automation_manager_credentials_add"} }

      it 'redirects to action new' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'new')
        controller.send(:button)
      end
    end

    context 'editing one or more ansible credentials' do
      let(:params) { {:pressed => "embedded_automation_manager_credentials_edit"} }

      it 'redirects to action edit' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'edit', :id => params[:miq_grid_checks])
        controller.send(:button)
      end
    end

    context 'deleting one or more ansible credentials from inventory' do
      let(:params) { {:pressed => "embedded_automation_manager_credentials_delete"} }

      it 'calls delete_credentials method' do
        expect(controller).to receive(:delete_credentials)
        controller.send(:button)
      end
    end

    context 'tagging one or more ansible credentials' do
      let(:params) { {:pressed => "ansible_credential_tag"} }

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(controller.class.model)
        controller.send(:button)
      end
    end
  end
end
