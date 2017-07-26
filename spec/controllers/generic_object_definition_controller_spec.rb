describe GenericObjectDefinitionController do
  include CompressedIds

  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.build(:zone) }

  describe "#show" do
    render_views
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      generic_obj_defn = FactoryGirl.create(:generic_object_definition)
      get :show, :params => {:id => generic_obj_defn.id}
    end
    it { expect(response.status).to eq(200) }
  end

  describe "#show_list" do
    before(:each) do
      stub_user(:features => :all)
      FactoryGirl.create(:generic_object_definition)
      get :show_list
    end
    it { expect(response.status).to eq(200) }
  end
end
