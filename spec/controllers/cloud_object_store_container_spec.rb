describe CloudObjectStoreContainerController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    @container = FactoryBot.create(:cloud_object_store_container, :name => "cloud-object-store-container-01")
    allow_any_instance_of(CloudObjectStoreContainer).to receive(:supports?).and_return(true)
  end

  describe "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }
    before do
      allow(@container).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryBot.create(:classification)
      @tag1 = FactoryBot.create(:classification_tag, :parent => classification)
      @tag2 = FactoryBot.create(:classification_tag, :parent => classification)
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

  describe "#delete" do
    let(:ems) { FactoryBot.create(:ems_openstack) }
    let(:container) { FactoryBot.create(:cloud_object_store_container, :name => "cloud-object-store-container-01", :ext_management_system => ems) }

    let(:task_options) do
      {
        :action => "deleting Cloud Object Store Container for user %{user}" %
          {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => "CloudObjectStoreContainer",
        :method_name => 'cloud_object_store_container_delete',
        :role        => 'ems_operations',
        :instance_id => container.id,
        :args        => []
      }
    end

    before do
      stub_user(:features => :all)
      session[:cloud_object_store_container_lastaction] = 'show'
      controller.params = {:pressed => "cloud_object_store_container_delete",
                           :id      => container.id}
      controller.instance_variable_set(:@breadcrumbs, [{:url => "cloud_object_store_container/show_list"}, 'placeholder'])
    end

    it "queues the delete action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      controller.send(:delete_cloud_object_store_containers)
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first).to eq(:message => "Delete initiated for 1 Cloud Object Store Container.",
                                         :level   => :success)
    end
  end

  context "create object store container" do
    before { stub_user(:features => :all) }

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
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
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
