describe SecurityGroupController do
  include_examples :shared_examples_for_security_group_controller, %w(openstack azure google amazon)

  let(:ems) { FactoryBot.create(:ems_openstack).network_manager }

  before do
    EvmSpecHelper.create_guid_miq_server_zone
    stub_user(:features => :all)
  end

  describe "#tags_edit" do
    let(:ct) { FactoryBot.create(:security_group, :name => "security-group-01") }
    let(:classification) { FactoryBot.create(:classification, :name => "department", :description => "Department") }
    let(:tag1) { FactoryBot.create(:classification_tag, :name => "tag1", :parent => classification) }
    let(:tag2) { FactoryBot.create(:classification_tag, :name => "tag2", :parent => classification) }

    before do
      session[:tag_db] = "SecurityGroup"
      session[:edit] = {
        :key        => "SecurityGroup_edit_tags__#{ct.id}",
        :tagging    => "SecurityGroup",
        :object_ids => [ct.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "security_group_tag", :format => :js, :id => ct.id }

      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "security_group/show/#{ct.id}"}, 'placeholder']

      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => ct.id }

      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "security_group/show/#{ct.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => ct.id, :data => get_tags_json([tag1, tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end
  end

  describe "#delete_security_groups" do
    let(:security_group) { FactoryBot.create(:security_group) }

    before do
      allow(controller).to receive(:assert_privileges)
      allow(controller).to receive(:delete_security_group_queue)
      controller.instance_variable_set(:@_security_group, security_group)
      controller.instance_variable_set(:@lastaction, "show")
      allow(controller).to receive(:checked_or_params).and_return(SecurityGroup.all.ids)
      allow_any_instance_of(SecurityGroup).to receive(:supports_delete?).and_return(true)
      allow_any_instance_of(SecurityGroup).to receive(:delete_security_group_queue)
    end

    subject { get(:delete_security_groups, :params => {:id => security_group.id}) }

    it "calls method for security groups processing" do
      expect(controller).to receive(:process_security_groups).with([security_group], "destroy")
      controller.send(:delete_security_groups)
    end
  end

  describe "#show" do
    let(:security_group) { FactoryBot.create(:security_group_with_firewall_rules) }

    render_views

    it "render" do
      get :show, :params => {:id => security_group.id}

      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => 'layouts/_textual_groups_generic')
      expect(response).to render_template(:partial => "layouts/listnav/_security_group")
    end
  end

  describe "#create" do
    let(:task_options) do
      {
        :action => "creating Security Group for user #{controller.current_user.userid}",
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => ems.class.name,
        :method_name => 'create_security_group',
        :instance_id => ems.id,
        :args        => [{:name => "test"}]
      }
    end

    it "builds create screen" do
      post :button, :params => { :pressed => "security_group_new", :format => :js }

      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the create action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      post :create, :params => { :button => "add", :format => :js, :name => 'test',
                                 :tenant_id => 'id', :ems_id => ems.id }
    end
  end

  describe "#edit" do
    let(:security_group) { FactoryBot.create(:security_group_with_firewall_rules_openstack, :ext_management_system => ems) }
    let(:security_group_task_options) do
      {
        :action => "updating Security Group for user #{controller.current_user.userid}",
        :userid => controller.current_user.userid
      }
    end
    let(:security_group_queue_options) do
      {
        :class_name  => security_group.class.name,
        :method_name => 'raw_update_security_group',
        :instance_id => security_group.id,
        :args        => [{:name => "foo2", :description => "New desc"}]
      }
    end
    let(:firewall_rule_task_options) do
      {
        :action => "create Security Group rule for user #{controller.current_user.userid}",
        :userid => controller.current_user.userid
      }
    end
    let(:firewall_rule_queue_options) do
      {
        :class_name  => security_group.class.name,
        :method_name => 'raw_create_security_group_rule',
        :instance_id => security_group.id,
        :args        => [security_group.ems_ref, "outbound", { :ethertype => "", :port_range_min => nil,
           :port_range_max => nil, :protocol => "tcp", :remote_group_id => nil, :remote_ip_prefix => nil }]
      }
    end

    it "builds edit screen" do
      post :button, :params => { :pressed => "security_group_edit", :format => :js, :id => security_group.id }

      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback)
        .with(security_group_task_options, hash_including(security_group_queue_options))
      expect(MiqTask).to receive(:generic_action_with_callback)
        .with(firewall_rule_task_options, hash_including(firewall_rule_queue_options))
      post :update, :params => { :button          => "save",
                                 :format          => :js,
                                 :id              => security_group.id,
                                 :name            => "foo2",
                                 :description     => "New desc",
                                 "firewall_rules" => { "0" => { "id" => "", "host_protocol" => "TCP", "direction" => "outbound" }}}
    end
  end

  describe "#delete" do
    let(:security_group) { FactoryBot.create(:security_group_openstack, :ext_management_system => ems) }
    let(:task_options) do
      {
        :action => "deleting Security Group for user #{controller.current_user.userid}",
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => security_group.class.name,
        :method_name => 'raw_delete_security_group',
        :instance_id => security_group.id,
        :args        => []
      }
    end

    it "queues the delete action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      post :button, :params => { :id => security_group.id, :pressed => "security_group_delete", :format => :js }
    end
  end

  describe '#button' do
    let(:security_group) { FactoryBot.create(:security_group) }

    before { controller.params = params }

    context 'tagging instances from their list, accessed from the details page of a security group' do
      let(:params) { {:pressed => "instance_tag"} }

      it 'calls tag method for tagging instances' do
        expect(controller).to receive(:tag).with(VmOrTemplate)
        controller.send(:button)
      end
    end

    %w[network_port security_group].each do |item|
      context "tagging #{item.camelize}" do
        let(:params) { {:pressed => "#{item}_tag"} }

        it 'calls tag method' do
          expect(controller).to receive(:tag).with(item.camelize.safe_constantize)
          controller.send(:button)
        end
      end
    end

    context 'comparing Instances displayed thru Security Group summary' do
      let(:params) { {:pressed => 'instance_compare'} }

      it 'calls comparemiq to compare Instances' do
        expect(controller).to receive(:comparemiq)
        controller.send(:button)
      end
    end

    context 'creating Security Group' do
      let(:params) { {:pressed => 'security_group_new'} }

      it 'redirect to action new' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'new')
        controller.send(:button)
      end
    end

    context 'editing Security Group' do
      let(:params) { {:pressed => 'security_group_edit', :id => security_group.id.to_s} }

      it 'redirect to action edit' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'edit', :id => security_group.id.to_s)
        controller.send(:button)
      end
    end

    context 'deleting Security Group' do
      let(:params) { {:pressed => 'security_group_delete'} }

      it 'redirect to action delete_security_groups' do
        expect(controller).to receive(:delete_security_groups)
        controller.send(:button)
      end
    end

    context 'custom buttons' do
      let(:params) { {:pressed => 'custom_button'} }

      it 'calls custom_buttons method' do
        expect(controller).to receive(:custom_buttons)
        controller.send(:button)
      end
    end

    %w[delete evacuate pause refresh reset resize retire scan shelve start stop suspend terminate].each do |action|
      context "#{action} for selected Instances displayed in a nested list" do
        let(:params) { {:pressed => "instance_#{action}"} }

        it "calls #{action + 'vms'} method" do
          allow(controller).to receive(:show)
          allow(controller).to receive(:performed?).and_return(true)
          expect(controller).to receive((action + 'vms').to_sym)
          controller.send(:button)
        end
      end
    end

    context 'editing Instance displayed in a nested list' do
      let(:params) { {:pressed => 'instance_edit'} }

      it 'calls edit_record method' do
        allow(controller).to receive(:render_or_redirect_partial)
        expect(controller).to receive(:edit_record)
        controller.send(:button)
      end
    end

    context 'setting Ownership for Instances in a nested list' do
      let(:params) { {:pressed => 'instance_ownership'} }

      it 'calls set_ownership' do
        expect(controller).to receive(:set_ownership)
        controller.send(:button)
      end
    end

    context 'managing policies for Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_protect'} }

      it 'calls assign_policies method' do
        expect(controller).to receive(:assign_policies).with(VmOrTemplate)
        controller.send(:button)
      end
    end

    context 'policy simulation for Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_policy_sim'} }

      it 'calls polsimvms method' do
        expect(controller).to receive(:polsimvms)
        controller.send(:button)
      end
    end

    context 'provisioning Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_miq_request_new'} }

      it 'calls prov_redirect' do
        allow(controller).to receive(:render_or_redirect_partial)
        expect(controller).to receive(:prov_redirect)
        controller.send(:button)
      end
    end

    context 'retirement for Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_retire_now'} }

      it 'calls retirevms_now' do
        allow(controller).to receive(:show)
        allow(controller).to receive(:performed?).and_return(true)
        expect(controller).to receive(:retirevms_now)
        controller.send(:button)
      end
    end

    context 'Live Migrate of Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_live_migrate'} }

      it 'calls livemigratevms' do
        expect(controller).to receive(:livemigratevms)
        controller.send(:button)
      end
    end

    context 'Soft Reboot of Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_guest_restart'} }

      it 'calls guestreboot' do
        allow(controller).to receive(:show)
        allow(controller).to receive(:performed?).and_return(true)
        expect(controller).to receive(:guestreboot)
        controller.send(:button)
      end
    end

    context 'Check Compliance of Instances displayed in a nested list' do
      let(:params) { {:miq_grid_checks => vm_instance.id.to_s, :pressed => 'instance_check_compliance', :id => security_group.id.to_s, :controller => 'security_group'} }
      let(:vm_instance) { FactoryBot.create(:vm_or_template) }

      before { allow(controller).to receive(:performed?).and_return(true) }

      it 'calls check_compliance_vms' do
        allow(controller).to receive(:show)
        expect(controller).to receive(:check_compliance_vms)
        controller.send(:button)
      end

      context 'Instance with VM Compliance policy assigned' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          EvmSpecHelper.create_guid_miq_server_zone
          allow(controller).to receive(:assert_privileges)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
          allow(controller).to receive(:drop_breadcrumb)
          vm_instance.add_policy(policy)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end
    end
  end
end
