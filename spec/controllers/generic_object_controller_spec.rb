describe GenericObjectController do
  include CompressedIds

  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.build(:zone) }

  describe "#show" do
    render_views
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      generic_obj = FactoryGirl.create(:generic_object)
      get :show, :params => {:id => generic_obj.id}
    end
    it { expect(response.status).to eq(200) }
  end

  describe "#show_list" do
    before(:each) do
      stub_user(:features => :all)
      FactoryGirl.create(:generic_object)
      get :show_list
    end
    it { expect(response.status).to eq(200) }
  end
end
