describe GenericObjectController do
  let!(:server) { EvmSpecHelper.local_miq_server }

  describe "#show" do
    render_views
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user, :features => "generic_object_show")
      generic_obj_defn = FactoryBot.create(:generic_object_definition)
      generic_obj = FactoryBot.create(:generic_object, :generic_object_definition_id => generic_obj_defn.id)
      get :show, :params => {:id => generic_obj.id}
    end
    it { expect(response.status).to eq(200) }

    it 'displays Generic Object association in the nested display list' do
      generic_obj_defn = FactoryBot.create(
        :generic_object_definition,
        :name       => "test_definition",
        :properties => {
          :attributes   => {
            :flag       => "boolean",
            :data_read  => "float",
            :max_number => "integer",
            :server     => "string",
            :s_time     => "datetime"
          },
          :associations => {"cp" => "ManageIQ::Providers::CloudManager", "vms" => "Vm"},
          :methods      => %w(some_method)
        }
      )
      generic_obj = FactoryBot.create(:generic_object, :generic_object_definition_id => generic_obj_defn.id)
      get :show, :params => { :display => "cp", :id => generic_obj.id }
      expect(response.status).to eq(200)

      get :show, :params => { :display => "vms", :id => generic_obj.id }
      expect(response.status).to eq(200)
    end
  end

  describe "#show_list" do
    before do
      stub_user(:features => :all)
      generic_obj_defn = FactoryBot.create(:generic_object_definition)
      FactoryBot.create(:generic_object, :generic_object_definition_id => generic_obj_defn.id)
      get :show_list
    end
    it { expect(response.status).to eq(200) }
  end

  describe "#tags_edit" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      user = FactoryBot.create(:user_with_group)
      stub_user(:features => :all)
      generic_obj_defn = FactoryBot.create(:generic_object_definition)
      @gobj = FactoryBot.create(:generic_object, :generic_object_definition_id => generic_obj_defn.id)
      allow(@gobj).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = Classification.find_by_name("department")
      @tag1 = FactoryBot.create(:classification_tag,
                                 :name   => "tag_1",
                                 :parent => classification)
      @tag2 = FactoryBot.create(:classification_tag,
                                 :name   => "tag_2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@gobj).and_return([@tag1, @tag2])
      session[:tag_db] = "GenericObject"
      session[:tag_items] = "GenericObject"
      session[:assigned_filters] = []
      edit = { :key       => "GenericObject_edit_tags__#{@gobj.id}",
               :tagging   => "GenericObject",
               :tag_items => [@gobj.id],
               :current   => {:assignments => []},
               :new       => {:assignments => [@tag1.id, @tag2.id]}}
      session[:edit] = edit
      controller.instance_variable_set(:@settings, {})
      allow(controller).to receive(:fetch_path)
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "generic_object_tag", :format => :js, :id => @gobj.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "generic_object/show/#{@gobj.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => @gobj.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "generic_object/show/#{@gobj.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => @gobj.id, :data => get_tags_json([@tag1, @tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end
end
