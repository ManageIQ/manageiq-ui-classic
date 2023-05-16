describe RestfulRedirectController do
  let(:user) { FactoryBot.create(:user_with_email, :role => 'super_administrator', :password => 'x') }

  before do
    EvmSpecHelper.create_guid_miq_server_zone
  end

  before do
    post '/dashboard/authenticate', :params => {:user_name => user.userid, :user_password => user.password}
  end

  context 'for MiqRequest' do
    let(:ems)      { FactoryBot.create(:ems_vmware_with_authentication) }
    let(:template) { FactoryBot.create(:template_vmware, :ext_management_system => ems) }
    let(:req) { FactoryBot.create(:miq_provision_request, :requester => user, :source => template) }

    before do
      # Load just one dialog instead of calling `MiqDialog.seed`
      MiqDialog.seed_dialog(
        Rails.root.join("product/dialogs/miq_dialogs/miq_provision_dialogs.yaml").to_s
      )
    end

    it 'redirects' do
      get '/restful_redirect', :params => {:model => 'MiqRequest', :id => req.id}
      expect(response).to redirect_to(:controller => 'miq_request', :action => 'show', :id => req.id)
      follow_redirect!
      expect(response).to have_http_status(:ok)
      expect(response).to render_template(:show)
      expect(response.body).to include(req.message)
    end
  end
end
