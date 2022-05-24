describe CloudObjectStoreContainerController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    @container = FactoryBot.create(:cloud_object_store_container, :name => "cloud-object-store-container-01")
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

  # include_examples '#download_summary_pdf', :cloud_object_store_container
end
