describe CloudObjectStoreObjectController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    allow_any_instance_of(CloudObjectStoreObject).to receive(:supports?).and_return(true)
  end

  let :object do
    FactoryGirl.create(:cloud_object_store_object)
  end

  context "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      @object = FactoryGirl.create(:cloud_object_store_object, :name => "cloud-object-store-container-01")
      allow(@object).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryGirl.create(:classification, :name => "department", :description => "D    epartment")
      @tag1 = FactoryGirl.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryGirl.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@container).and_return([@tag1, @tag2])
      session[:tag_db] = "CloudObjectStoreObject"
      edit = {
        :key        => "CloudObjectStoreObject_edit_tags__#{@object.id}",
        :tagging    => "CloudObjectStoreObject",
        :object_ids => [@object.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "builds tagging screen" do
      post :button, :pressed => "cloud_object_store_object_tag", :format => :js, :id => @object.id
      expect(assigns(:flash_array)).to be_nil
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_object_store_object/show/#{@object.id}"}, 'placeholder']
      post :tagging_edit, :button => "cancel", :format => :js, :id => @object.id
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_object_store_object/show/#{@object.id}"}, 'placeholder']
      post :tagging_edit, :button => "save", :format => :js, :id => @object.id
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  context "delete object store object" do
    before do
      login_as FactoryGirl.create(:user, :features => "everything")
      request.parameters["controller"] = "cloud_object_store_object"
      allow(controller).to receive(:role_allows?).and_return(true)
    end

    it "delete invokes process_cloud_object_storage_buttons" do
      expect(controller).to receive(:process_cloud_object_storage_buttons)
      post :button, :params => {
        :pressed => "cloud_object_store_object_delete", :format => :js, :id => object.id
      }
    end

    it "delete triggers delete" do
      expect(controller).to receive(:cloud_object_store_button_operation).with(
        CloudObjectStoreObject,
        'delete'
      )
      post :button, :params => {
        :pressed => "cloud_object_store_object_delete", :format => :js, :id => object.id
      }
    end

    it "delete redirects to show_list" do
      expect(controller).to receive(:javascript_redirect).with(
        :action      => 'show_list',
        :flash_msg   => anything,
        :flash_error => false
      )
      post :button, :params => {
        :pressed => "cloud_object_store_object_delete", :format => :js, :id => object.id
      }
    end

    it "delete shows expected flash" do
      post :button, :params => {
        :pressed => "cloud_object_store_object_delete", :format => :js, :id => object.id
      }

      expect(assigns(:flash_array).first[:message]).to include(
        "Delete initiated for 1 Cloud Object Store Object from the ManageIQ Database"
      )
      expect(response.status).to eq(200)
    end

    it "delete shows expected flash (non-existing object)" do
      object.destroy

      post :button, :params => {
        :pressed => "cloud_object_store_object_delete", :format => :js, :id => object.id
      }

      expect(assigns(:flash_array).first[:message]).to include(
        "Cloud Object Store Object no longer exists"
      )
      expect(response.status).to eq(200)
    end
  end

  include_examples '#download_summary_pdf', :cloud_object_store_object
end
