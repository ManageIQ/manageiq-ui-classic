describe CloudObjectStoreContainerController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    @container = FactoryBot.create(:cloud_object_store_container, :name => "cloud-object-store-container-01")
    allow_any_instance_of(CloudObjectStoreContainer).to receive(:supports?).and_return(true)
  end

  context "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }
    before do
      allow(@container).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = Classification.find_by_name("department")
      @tag1 = FactoryBot.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryBot.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@container).and_return([@tag1, @tag2])
      session[:tag_db] = "CloudObjectStoreContainer"
      edit = {
        :key        => "CloudObjectStoreContainer_edit_tags__#{@container.id}",
        :tagging    => "CloudObjectStoreContainer",
        :object_ids => [@container.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "cloud_object_store_container_tag", :format => :js, :id => @container.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_object_store_container/show/#{@container.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => @container.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_object_store_container/show/#{@container.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => @container.id, :data => get_tags_json([@tag1, @tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  context "delete object store container" do
    before do
      login_as FactoryBot.create(:user, :features => "everything")
      request.parameters["controller"] = "cloud_object_store_container"
      allow(controller).to receive(:role_allows?).and_return(true)
      allow(controller).to receive(:previous_breadcrumb_url).and_return("previous-url")
    end

    it "delete invokes process_cloud_object_storage_buttons" do
      expect(controller).to receive(:process_cloud_object_storage_buttons)
      post :button, :params => {
        :pressed => "cloud_object_store_container_delete", :format => :js, :id => @container.id
      }
    end

    it "delete triggers delete" do
      expect(controller).to receive(:cloud_object_store_button_operation).with(
        CloudObjectStoreContainer,
        'delete'
      )
      post :button, :params => {
        :pressed => "cloud_object_store_container_delete", :format => :js, :id => @container.id
      }
    end

    it "delete redirects to previous breadcrumb if on container's details page" do
      session[:cloud_object_store_container_display] = "main"
      expect(controller).to receive(:javascript_redirect).with("previous-url")
      expect(controller).not_to receive(:render_flash)

      post :button, :params => {
        :pressed => "cloud_object_store_container_delete", :format => :js, :id => @container.id
      }
    end

    it "delete does not redirect if on container list page" do
      session[:cloud_object_store_container_display] = nil
      expect(controller).not_to receive(:javascript_redirect)
      expect(controller).to receive(:render_flash)

      post :button, :params => {
        :pressed => "cloud_object_store_container_delete", :format => :js, :id => @container.id
      }
    end

    it "delete does not redirect if on object list page" do
      session[:cloud_object_store_container_display] = "cloud_object_store_objects"
      expect(controller).not_to receive(:javascript_redirect)
      expect(controller).to receive(:render_flash)

      post :button, :params => {
        :pressed => "cloud_object_store_container_delete", :format => :js, :id => @container.id
      }
    end

    it "clear does not redirect but only renders flash" do
      session[:cloud_object_store_container_display] = nil
      expect(controller).not_to receive(:javascript_redirect)
      expect(controller).to receive(:render_flash)

      post :button, :params => {
        :pressed => "cloud_object_store_container_clear", :format => :js, :id => @container.id
      }
    end

    it "delete shows expected flash" do
      post :button, :params => {
        :pressed => "cloud_object_store_container_delete", :format => :js, :id => @container.id
      }

      expect(assigns(:flash_array).first[:message]).to include(
        "Delete initiated for 1 Cloud Object Store Container from the ManageIQ Database"
      )
      expect(response.status).to eq(200)
    end

    it "delete shows expected flash (non-existing container)" do
      @container.destroy

      post :button, :params => {
        :pressed => "cloud_object_store_container_delete", :format => :js, :id => @container.id
      }

      expect(response.body).to match(/throw "error"/)
    end
  end

  describe "create object store container" do
    before do
      stub_user(:features => :all)
    end

    shared_examples "queue create container task" do
      let(:task_options) do
        {
          :action => "creating Cloud Object Store Container for user %{user}" %
            {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end

      let(:queue_options) do
        {
          :class_name  => "CloudObjectStoreContainer",
          :method_name => 'cloud_object_store_container_create',
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => [@ems.id, @expected_args]
        }
      end

      it "builds add new container screen" do
        post :button, :params => { :pressed => "cloud_object_store_container_new", :format => :js }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the create cloud object store container action form" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :create, :params => @form_params.merge(:button => "add", :format => :js)
      end
    end

    context "in Amazon S3" do
      before do
        stub_settings_merge(
          :prototype => {
            :amazon => {
              :s3 => true
            }
          }
        )
        @cloud_manager = FactoryBot.create(:ems_amazon)
        @ems = @cloud_manager.s3_storage_manager

        @form_params = {
          :name               => "bucket-01",
          :emstype            => "ManageIQ::Providers::Amazon::StorageManager::S3",
          :parent_emstype     => "ManageIQ::Providers::Amazon::CloudManager",
          :storage_manager_id => @ems.id,
          :provider_region    => "eu-central-1",
        }

        @expected_args = {
          :name                        => "bucket-01",
          :create_bucket_configuration => {:location_constraint => "eu-central-1"}
        }
      end

      context "create" do
        it_behaves_like "queue create container task"
      end

      it "aws regions" do
        provider_regions = controller.send(:retrieve_provider_regions)

        expect(provider_regions["ManageIQ::Providers::Amazon::CloudManager"]).not_to be_nil
        expect(provider_regions["ManageIQ::Providers::Amazon::CloudManager"].count).to be > 0
      end
    end
  end

  # include_examples '#download_summary_pdf', :cloud_object_store_container
end
