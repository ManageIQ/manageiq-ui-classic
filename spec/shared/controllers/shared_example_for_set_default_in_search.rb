shared_examples 'Set Default in search bar' do
  describe "#save_default_search" do
    render_views

    before { EvmSpecHelper.create_guid_miq_server_zone }
    let(:user) { FactoryBot.create(:user_admin, :settings => {:default_search => {}}) }

    it "saves the default search" do
      search = FactoryBot.create(:miq_search, :name => 'sds')
      session[:settings] = {}

      login_as user
      session[:view] = controller.send(:get_db_view, controller.class.model)

      post :save_default_search, :params => {:id => search.id}
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')

      user.reload
      expect(user.settings).to eq(:default_search => {session[:view].db.to_sym => search.id})
    end
  end
end
