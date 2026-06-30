describe ChargebackAssignmentController do
  before { stub_user(:features => :all) }

  describe "#index" do
    render_views

    it "can be rendered" do
      EvmSpecHelper.create_guid_miq_server_zone
      get :index
      expect(response.status).to eq(200)
      expect(response).to render_template('index')
    end
  end
end
