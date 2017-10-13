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

  context "#button" do
    render_views

    before(:each) do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      ApplicationController.handle_exceptions = true
    end

    it "when Generic Object Tag is pressed for the generic object nested list" do
      definition = FactoryGirl.create(:generic_object_definition)
      go = FactoryGirl.create(:generic_object, :generic_object_definition_id => definition.id)
      get :show, :params => {:id => definition.id, :display => 'generic_objects'}
      post :button, :params => {:pressed => "generic_object_tag", "check_#{go.id}" => "1", :id => definition.id, :display => 'generic_objects',  :format => :js}
      expect(response.status).to eq(200)
      expect(response.body).to include('generic_object_definition/tagging_edit')
    end
  end
end
