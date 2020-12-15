describe MiqPolicySetController do
  before do
    stub_user(:features => :all)
  end

  context "show_list" do
    it "renders index" do
      get :index
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
    end
  end
end
