describe CloudVolumeController do
  context "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @volume = FactoryBot.create(:cloud_volume, :name => "cloud-volume-01")
      allow(@volume).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryBot.create(:classification, :name => "department", :description => "Department")
      @tag1 = FactoryBot.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryBot.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@volume).and_return([@tag1, @tag2])
      session[:tag_db] = "CloudVolume"
      edit = {
        :key        => "CloudVolume_edit_tags__#{@volume.id}",
        :tagging    => "CloudVolume",
        :object_ids => [@volume.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "builds tagging screen" do
      post :button, :params => {:pressed => "cloud_volume_tag", :format => :js, :id => @volume.id}
      expect(assigns(:flash_array)).to be_nil
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_volume/show/#{@volume.id}"}, 'placeholder']
      post :tagging_edit, :params => {:button => "cancel", :format => :js, :id => @volume.id}
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_volume/show/#{@volume.id}"}, 'placeholder']
      post :tagging_edit, :params => {:button => "save", :format => :js, :id => @volume.id, :data => get_tags_json([@tag1, @tag2])}
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  describe "#create_backup" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack)
      @volume = FactoryBot.create(:cloud_volume_openstack,
                                   :name                  => "cloud-volume-01",
                                   :ext_management_system => @ems)
      @backup = FactoryBot.create(:cloud_volume_backup)
    end

    context "#create_backup" do
      let(:task_options) do
        {
          :action => "creating Cloud Volume Backup for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @volume.class.name,
          :method_name => "backup_create",
          :instance_id => @volume.id,
          :role        => "ems_operations",
          :zone        => @ems.my_zone,
          :args        => [{:name => "backup_name"}]
        }
      end

      it "builds create backup screen" do
        post :button, :params => { :pressed => "cloud_volume_backup_create", :format => :js, :id => @volume.id }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the create cloud backup action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :backup_create, :params => { :button => "create",
          :format => :js, :id => @volume.id, :backup_name => 'backup_name' }
      end
    end
  end

  describe "#new" do
    let(:feature) { MiqProductFeature.find_all_by_identifier(%w(cloud_volume_new)) }
    let(:role)    { FactoryBot.create(:miq_user_role, :miq_product_features => feature) }
    let(:group)   { FactoryBot.create(:miq_group, :miq_user_role => role) }
    let(:user)    { FactoryBot.create(:user, :miq_groups => [group]) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      EvmSpecHelper.seed_specific_product_features(%w(cloud_volume_new))

      login_as user
    end

    it "raises an exception when the user does not have the privileges" do
      expect do
        bypass_rescue
        post :new, :params => {:button => "new", :format => :js}
      end.to raise_error(MiqException::RbacPrivilegeException)
    end
  end

  describe '#new' do
    render_views

    let(:features) { MiqProductFeature.find_all_by_identifier(%w(cloud_volume_new cloud_tenant_show_list)) }
    let(:role)    { FactoryBot.create(:miq_user_role, :miq_product_features => features) }
    let(:group)   { FactoryBot.create(:miq_group, :miq_user_role => role) }
    let(:user)    { FactoryBot.create(:user, :miq_groups => [group]) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      EvmSpecHelper.seed_specific_product_features(%w(cloud_volume_new cloud_tenant_show_list))

      login_as user
    end

    it "renders the correct template when the user has the privileges" do
      post :new, :params => {:button => "new", :format => :js}
      expect(assigns(:flash_array)).to be_nil
      expect(response).to render_template('cloud_volume/_common_new_edit')
      expect(response.status).to eq(200)
    end
  end

  describe "#restore_backup" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack)
      @volume = FactoryBot.create(:cloud_volume_openstack,
                                   :name                  => "cloud-volume-01",
                                   :ext_management_system => @ems)
      @backup = FactoryBot.create(:cloud_volume_backup)
    end

    context "#restore_backup" do
      let(:task_options) do
        {
          :action => "restoring Cloud Volume from Backup for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @volume.class.name,
          :method_name => "backup_restore",
          :instance_id => @volume.id,
          :role        => "ems_operations",
          :zone        => @ems.my_zone,
          :args        => [@backup.ems_ref]
        }
      end

      it "builds restore backup screen" do
        post :button, :params => { :pressed => "cloud_volume_backup_restore", :format => :js, :id => @volume.id }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues restore from a cloud backup action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :backup_restore, :params => { :button => "restore",
          :format => :js, :id => @volume.id, :backup_id => @backup.id }
      end
    end
  end

  describe "#create_snapshot" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack)
      @volume = FactoryBot.create(:cloud_volume_openstack,
                                   :name                  => "cloud-volume-01",
                                   :ext_management_system => @ems)
      @snapshot = FactoryBot.create(:cloud_volume_snapshot)
    end

    context "#create_snapshot" do
      let(:task_options) do
        {
          :action => "creating volume snapshot in #{@ems.inspect} for #{@volume.inspect} with #{{:name => "snapshot_name"}.inspect}",
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @volume.class.name,
          :instance_id => @volume.id,
          :method_name => 'create_volume_snapshot',
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => [{:name => "snapshot_name"}]
        }
      end

      it "builds create snapshot screen" do
        post :button, :params => { :pressed => "cloud_volume_snapshot_create", :format => :js, :id => @volume.id }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the create cloud snapshot action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :snapshot_create, :params => { :button => "create",
          :format => :js, :id => @volume.id, :snapshot_name => 'snapshot_name' }
      end
    end
  end

  describe "#create_volume" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    shared_examples "queue create volume task" do
      let(:task_options) do
        {
          :action => "creating Cloud Volume for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => "CloudVolume",
          :method_name => 'create_volume',
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => @task_options
        }
      end

      it "builds add new volume screen" do
        post :button, :params => { :pressed => "cloud_volume_new", :format => :js }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the create cloud volume action form OpenStack" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :create, :params => @form_params.merge(:button => "add", :format => :js)
      end
    end

    context "in OpenStack cloud" do
      before do
        @ems = FactoryBot.create(:ems_openstack)
        @tenant = FactoryBot.create(:cloud_tenant_openstack, :ext_management_system => @ems)

        @form_params = { :name => "volume", :size => 1, :cloud_tenant_id => @tenant.id,
                         :emstype => "ManageIQ::Providers::StorageManager::CinderManager" }
        @task_options = [@ems.id, { :name => "volume", :size => 1, :cloud_tenant => @tenant }]
      end

      it_behaves_like "queue create volume task"
    end

    context "in Amazon EBS" do
      before do
        @cloud_manager = FactoryBot.create(:ems_amazon)
        @ems = FactoryBot.create(:ems_amazon_ebs, :parent_manager => @cloud_manager)
        @availability_zone = FactoryBot.create(:availability_zone,
                                                :ems_ref               => "us-east-1e",
                                                :ext_management_system => @cloud_manager)

        # Common form parameters for the Amazon EBS volume.
        @form_params = {
          :emstype                  => "ManageIQ::Providers::Amazon::StorageManager::Ebs",
          :storage_manager_id       => @ems.id,
          :name                     => "volume",
          :size                     => 1,
          :aws_availability_zone_id => @availability_zone.ems_ref,
        }
        # Common EC2 client options
        @aws_options = {
          :name              => "volume", :size => 1,
          :availability_zone => @availability_zone.ems_ref
        }
        # Task options include the ID of the EMS and provider-specific options.
        @task_options = [@ems.id, @aws_options]
      end

      context "for volume type 'gp2'" do
        before do
          # 'gp2' volume type requires only the type
          @form_params[:volume_type] = "gp2"
          @aws_options[:volume_type] = "gp2"
          @aws_options[:encrypted] = nil
        end

        it_behaves_like "queue create volume task"
      end

      context "for volume type 'io1'" do
        before do
          # 'io1' volume type requires the IOPS as well.
          @form_params[:volume_type] = "io1"
          @form_params[:aws_iops] = "100"

          @aws_options[:volume_type] = "io1"
          @aws_options[:iops] = "100"
          @aws_options[:encrypted] = nil
        end

        it_behaves_like "queue create volume task"
      end

      context "for encrypted volume" do
        before do
          # 'gp2' volume type requires only the type
          @form_params[:volume_type] = "gp2"
          @form_params[:aws_encryption] = "true"
          @aws_options[:volume_type] = "gp2"
          @aws_options[:encrypted] = "true"
        end

        it_behaves_like "queue create volume task"
      end
    end
  end

  include_examples '#download_summary_pdf', :cloud_volume
end
