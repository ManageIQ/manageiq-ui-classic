describe CloudObjectStoreObjectController do
  let(:object) { FactoryBot.create(:cloud_object_store_object) }
  let(:classification) { FactoryBot.create(:classification) }
  let(:tag1) { FactoryBot.create(:classification_tag, :parent => classification) }
  let(:tag2) { FactoryBot.create(:classification_tag, :parent => classification) }

  before do
    EvmSpecHelper.create_guid_miq_server_zone
    allow_any_instance_of(CloudObjectStoreObject).to receive(:supports?).and_return(true)
    FactoryBot.create(:tagging, :tag => tag1.tag, :taggable => object)
    FactoryBot.create(:tagging, :tag => tag2.tag, :taggable => object)
    stub_user(:features => :all)
  end

  describe "#tags_edit" do
    before do
      session[:tag_db] = "CloudObjectStoreObject"
      session[:edit] = {
        :key        => "CloudObjectStoreObject_edit_tags__#{object.id}",
        :tagging    => "CloudObjectStoreObject",
        :object_ids => [object.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "cloud_object_store_object_tag", :format => :js, :id => object.id }

      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_object_store_object/show/#{object.id}"}, 'placeholder']

      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => object.id }

      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_object_store_object/show/#{object.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => object.id, :data => get_tags_json([tag1, tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end
  end

  describe "delete object store object" do
    before do
      login_as FactoryBot.create(:user, :features => "everything")
      request.parameters["controller"] = "cloud_object_store_object"
      allow(controller).to receive(:role_allows?).and_return(true)
      allow(controller).to receive(:previous_breadcrumb_url).and_return("previous-url")
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

    it "delete redirects to previous breadcrumb if on object's details page" do
      session[:cloud_object_store_object_display] = "main"

      expect(controller).to receive(:javascript_redirect).with("previous-url")

      post :button, :params => {
        :pressed => "cloud_object_store_object_delete", :format => :js, :id => object.id
      }
    end

    it "delete does not redirect if on object list page" do
      session[:cloud_object_store_object_display] = "show_list"

      expect(controller).not_to receive(:javascript_redirect)

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

      expect(response.body).to match(/throw "error"/)
    end
  end

  include_examples '#download_summary_pdf', :cloud_object_store_object
end
