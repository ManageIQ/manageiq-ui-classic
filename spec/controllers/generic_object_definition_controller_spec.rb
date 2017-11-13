describe GenericObjectDefinitionController do
  include CompressedIds

  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.build(:zone) }

  describe "#show" do
    render_views
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
    end

    it "should redirect to #show_list" do
      generic_obj_defn = FactoryGirl.create(:generic_object_definition)
      allow(controller).to receive(:build_tree)
      allow(@tree).to receive(:name).and_return('abc')
      allow(@tree).to receive(:locals_for_render).and_return(:bs_tree => {})
      allow_message_expectations_on_nil
      get :show, :params => {:id => generic_obj_defn.id}
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
      expect(controller.x_node).to eq("god-#{to_cid(generic_obj_defn.id)}")
    end
  end

  describe "#show_list" do
    before(:each) do
      stub_user(:features => :all)
      FactoryGirl.create(:generic_object_definition)
      allow(controller).to receive(:build_tree)
      allow(controller).to receive(:exp_build_table)
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
      allow(controller).to receive(:build_tree)
    end

    it "when Generic Object Tag is pressed for the generic object nested list" do
      definition = FactoryGirl.create(:generic_object_definition)
      go = FactoryGirl.create(:generic_object, :generic_object_definition_id => definition.id)
      get :show, :params => {:id => definition.id, :display => 'generic_objects'}
      post :button, :params => {:pressed => "generic_object_tag", "check_#{go.id}" => "1", :id => definition.id, :display => 'generic_objects', :format => :js}
      expect(response.status).to eq(200)
      expect(response.body).to include('generic_object_definition/tagging_edit')
    end
  end
end
