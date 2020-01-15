describe ApplicationController do
  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.create(:zone) }

  before do
    EvmSpecHelper.local_miq_server
    login_as FactoryGirl.create(:user, :features => "everything")
    allow(controller).to receive(:role_allows?).and_return(true)
  end

  describe '#process_vm_buttons' do
    before { controller.params = {:pressed => 'vm_reconfigure'} }

    it 'calls vm_reconfigure for reconfiguring VMs' do
      expect(controller).to receive(:vm_reconfigure)
      controller.send(:process_vm_buttons, 'vm')
    end
  end

  describe "#generic_button_operation" do
    let(:vm1) { FactoryGirl.create(:vm_redhat) }
    let(:vm2) { FactoryGirl.create(:vm_microsoft) }
    let(:vm3) { FactoryGirl.create(:vm_vmware) }
    let(:controller_name) { VmOrTemplate }

    context 'record does not support the action' do
      it 'processes the operation' do
        controller.instance_variable_set(
          :@_params,
          :miq_grid_checks => "#{vm1.id}, #{vm3.id}, #{vm2.id}")
        # calling 'vm_button_action' creates a proc calling 'process_objects'
        expect(controller).to receive(:javascript_flash).with(
          :text => "Smartstate Analysis action does not apply to selected items",
          :severity => :error,
          :scroll_top => true)
        process_proc = controller.send(:vm_button_action)
        controller.send(
          :generic_button_operation,
          'scan',
          "Smartstate Analysis",
          process_proc)
      end
    end

    context 'operations on nested list of items of a Cluster' do
      before do
        controller.instance_variable_set(:@_params, params)
        request.parameters['controller'] = 'ems_cluster'
        allow(controller).to receive(:find_records_with_rbac).and_call_original
        allow(controller).to receive(:render)
      end

      subject { controller.send(:vm_button_action) }

      context 'operations on VMs' do
        let(:params) { {:display => 'all_vms', :miq_grid_checks => vm1.id.to_s} }

        %w[refresh_ems scan collect_running_processes start stop suspend reset reboot_guest shutdown_guest].each do |action|
          it 'calls find_records_with_rbac with proper record class to set selected records' do
            expect(controller).to receive(:find_records_with_rbac).with(VmOrTemplate, [vm1.id])
            controller.send(:generic_button_operation, action, 'some_name', subject)
          end
        end
      end

      context 'operations on Templates' do
        let(:template) { FactoryBot.create(:miq_template) }
        let(:params) { {:pressed => 'miq_template_refresh', :miq_grid_checks => template.id.to_s} }

        %w[refresh_ems scan].each do |action|
          it 'calls find_records_with_rbac with proper record class to set selected records' do
            expect(controller).to receive(:find_records_with_rbac).with(VmOrTemplate, [template.id])
            controller.send(:generic_button_operation, action, 'some_name', subject)
          end
        end
      end
    end
  end

  describe "#action_to_feature" do
    let(:record) { FactoryGirl.create(:vm_redhat) }

    context 'the UI action is also a queryable feature' do
      before do
        controller.instance_variable_set(:@_params, :id => record.id)
        allow(controller).to receive(:render)
      end

      it 'uses the "reset" action to ask for records support for it' do
        expect(controller).to receive(:records_support_feature?)
          .with([record], :reset)
        process_proc = controller.send(:vm_button_action)
        controller.send(
          :generic_button_operation,
          'reset',
          "Reset",
          process_proc)
      end
    end

    context 'the UI action is not a queryable feature' do
      before do
        controller.instance_variable_set(:@_params, :id => record.id)
        allow(controller).to receive(:render)
      end

      it 'uses the "retire" feature to ask for records support for it' do
        expect(controller).to receive(:records_support_feature?)
          .with([record], :retire)
        process_proc = controller.send(:vm_button_action)
        controller.send(
          :generic_button_operation,
          'retire_now',
          "Retirement",
          process_proc)
      end
    end
  end

  context "Verify proper methods are called for snapshot" do
    before(:each) do
      allow(subject).to receive(:vm_button_action).and_return(subject.method(:process_objects))
    end

    it "Delete All" do
      expect(controller).to receive(:generic_button_operation)
        .with('remove_all_snapshots',
              'Delete All Snapshots',
              subject.send(:vm_button_action),
              :refresh_partial => 'vm_common/config')
      controller.send(:vm_snapshot_delete_all)
    end

    it "Delete Selected" do
      expect(controller).to receive(:generic_button_operation)
        .with('remove_snapshot',
              'Delete Snapshot',
              subject.send(:vm_button_action),
              :refresh_partial => 'vm_common/config')
      controller.send(:vm_snapshot_delete)
    end
  end

  context "Delete object store container" do
    before do
      allow(controller).to receive(:assert_rbac).and_return(nil)
      allow_any_instance_of(CloudObjectStoreContainer).to receive(:supports?).and_return(true)
    end

    let :container1 do
      FactoryGirl.create(:cloud_object_store_container)
    end

    let :container2 do
      FactoryGirl.create(:cloud_object_store_container)
    end

    context "from list view" do
      before do
        controller.params[:pressed] = "cloud_object_store_container_delete"
        request.parameters["controller"] = "ems_storage"
        controller.instance_variable_set(:@display, "cloud_object_store_containers")
      end

      it "get_rec_cls" do
        expect(controller.send(:get_rec_cls)).to eq(CloudObjectStoreContainer)
      end

      it "invokes cloud_object_store_button_operation" do
        expect(controller).to receive(:cloud_object_store_button_operation).with(
          CloudObjectStoreContainer,
          'delete'
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_delete")
      end

      it "invokes process_objects" do
        controller.params[:miq_grid_checks] = "#{container1.id}, #{container2.id}"
        expect(controller).to receive(:process_objects).with(
          [container1.id, container2.id],
          'cloud_object_store_container_delete',
          'Delete'
        )
        controller.send(:cloud_object_store_button_operation, CloudObjectStoreContainer, 'delete')
      end

      it "invokes process_tasks on container class" do
        expect(CloudObjectStoreContainer).to receive(:process_tasks).with(
          :ids    => [container1.id, container2.id],
          :task   => 'cloud_object_store_container_delete',
          :userid => anything
        )
        controller.send(:process_objects, [container1.id, container2.id], 'cloud_object_store_container_delete',
                        'delete')
      end

      it "invokes process_tasks overall (when selected)" do
        controller.params[:miq_grid_checks] = "#{container1.id}, #{container2.id}"
        expect(CloudObjectStoreContainer).to receive(:process_tasks).with(
          :ids    => [container1.id, container2.id],
          :task   => 'cloud_object_store_container_delete',
          :userid => anything
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_delete")
      end

      it "raises an error when nothing selected" do
        controller.params[:miq_grid_checks] = ''
        expect { controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_delete") }.to raise_error("Can't access records without an id")
      end

      it "flash - task not supported" do
        controller.params[:miq_grid_checks] = "#{container1.id}, #{container2.id}"
        allow_any_instance_of(CloudObjectStoreContainer).to receive(:supports?).and_return(false)
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_delete")
        expect(assigns(:flash_array).first[:message]).to include(
          "Delete does not apply to at least one of the selected items"
        )
      end
    end

    context "from details view" do
      before do
        allow(controller).to receive(:show_list).and_return(nil)
        controller.params[:pressed] = "cloud_object_store_container_delete"
        request.parameters["controller"] = "cloud_object_store_container"
      end

      let :container do
        FactoryGirl.create(:cloud_object_store_container)
      end

      it "get_rec_cls" do
        expect(controller.send(:get_rec_cls)).to eq(CloudObjectStoreContainer)
      end

      it "invokes cloud_object_store_button_operation" do
        expect(controller).to receive(:cloud_object_store_button_operation).with(
          CloudObjectStoreContainer,
          'delete'
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_delete")
      end

      it "invokes process_objects" do
        controller.params[:id] = container.id
        expect(controller).to receive(:process_objects).with(
          [container.id],
          'cloud_object_store_container_delete',
          'Delete'
        )
        controller.send(:cloud_object_store_button_operation, CloudObjectStoreContainer, 'delete')
      end

      it "invokes process_tasks on container class" do
        expect(CloudObjectStoreContainer).to receive(:process_tasks).with(
          :ids    => [container.id],
          :task   => 'cloud_object_store_container_delete',
          :userid => anything
        )
        controller.send(:process_objects, [container.id], 'cloud_object_store_container_delete', 'delete')
      end

      it "invokes process_tasks overall" do
        controller.params[:id] = container.id
        expect(CloudObjectStoreContainer).to receive(:process_tasks).with(
          :ids    => [container.id],
          :task   => 'cloud_object_store_container_delete',
          :userid => anything
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_delete")
      end

      it "flash - container no longer exists" do
        expect { controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_delete") }.to raise_error("Can't access records without an id")
      end

      it "flash - task not supported" do
        controller.params[:id] = container.id
        allow_any_instance_of(CloudObjectStoreContainer).to receive(:supports?).and_return(false)
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_delete")
        expect(assigns(:flash_array).first[:message]).to include(
          "Delete does not apply to this item"
        )
      end
    end
  end

  context "Delete object store object" do
    before do
      allow(controller).to receive(:assert_rbac).and_return(nil)
      allow_any_instance_of(CloudObjectStoreObject).to receive(:supports?).and_return(true)
    end

    let :object1 do
      FactoryGirl.create(:cloud_object_store_object)
    end

    let :object2 do
      FactoryGirl.create(:cloud_object_store_object)
    end

    context "from list view" do
      before do
        controller.params[:pressed] = "cloud_object_store_object_delete"
        request.parameters["controller"] = "cloud_object_store_container"
        controller.instance_variable_set(:@display, "cloud_object_store_objects")
      end

      it "get_rec_cls" do
        expect(controller.send(:get_rec_cls)).to eq(CloudObjectStoreObject)
      end

      it "invokes cloud_object_store_button_operation" do
        expect(controller).to receive(:cloud_object_store_button_operation).with(
          CloudObjectStoreObject,
          "delete"
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete")
      end

      it "invokes process_objects" do
        controller.params[:miq_grid_checks] = "#{object1.id}, #{object2.id}"
        expect(controller).to receive(:process_objects).with(
          [object1.id, object2.id],
          "cloud_object_store_object_delete",
          "Delete"
        )
        controller.send(:cloud_object_store_button_operation, CloudObjectStoreObject, "delete")
      end

      it "invokes process_tasks on container class" do
        controller.params[:miq_grid_checks] = "#{object1.id}, #{object2.id}"
        expect(CloudObjectStoreObject).to receive(:process_tasks).with(
          :ids    => [object1.id, object2.id],
          :task   => "cloud_object_store_object_delete",
          :userid => anything
        )
        controller.send(:process_objects, [object1.id, object2.id], "cloud_object_store_object_delete", "delete")
      end

      it "invokes process_tasks overall (when selected)" do
        controller.params[:miq_grid_checks] = "#{object1.id}, #{object2.id}"
        expect(CloudObjectStoreObject).to receive(:process_tasks).with(
          :ids    => [object1.id, object2.id],
          :task   => "cloud_object_store_object_delete",
          :userid => anything
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete")
      end

      it "does not invoke process_tasks overall when nothing selected" do
        controller.params[:miq_grid_checks] = ""
        expect(CloudObjectStoreObject).not_to receive(:process_tasks)
        expect { controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete") }.to raise_error("Can't access records without an id")
      end

      it "flash - nothing selected" do
        controller.params[:miq_grid_checks] = ""
        expect { controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete") }.to raise_error("Can't access records without an id")
      end

      it "flash - task not supported" do
        controller.params[:miq_grid_checks] = "#{object1.id}, #{object2.id}"
        allow_any_instance_of(CloudObjectStoreObject).to receive(:supports?).and_return(false)
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete")
        expect(assigns(:flash_array).first[:message]).to include(
          "Delete does not apply to at least one of the selected items"
        )
      end
    end

    context "from details view" do
      before do
        allow(controller).to receive(:show_list).and_return(nil)
        controller.params[:pressed] = "cloud_object_store_object_delete"
        request.parameters["controller"] = "cloud_object_store_object"
      end

      let :object do
        FactoryGirl.create(:cloud_object_store_object)
      end

      it "get_rec_cls" do
        expect(controller.send(:get_rec_cls)).to eq(CloudObjectStoreObject)
      end

      it "invokes cloud_object_store_button_operation" do
        expect(controller).to receive(:cloud_object_store_button_operation).with(
          CloudObjectStoreObject,
          "delete"
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete")
      end

      it "invokes process_objects" do
        controller.params[:id] = object.id.to_s
        expect(controller).to receive(:process_objects).with(
          [object.id],
          "cloud_object_store_object_delete",
          "Delete"
        )
        controller.send(:cloud_object_store_button_operation, CloudObjectStoreObject, "delete")
      end

      it "invokes process_tasks on object class" do
        controller.params[:id] = object.id.to_s
        expect(CloudObjectStoreObject).to receive(:process_tasks).with(
          :ids    => [object.id.to_s],
          :task   => "cloud_object_store_object_delete",
          :userid => anything
        )
        controller.send(:process_objects, [object.id.to_s], "cloud_object_store_object_delete", "delete")
      end

      it "invokes process_tasks overall" do
        controller.params[:id] = object.id.to_s
        expect(CloudObjectStoreObject).to receive(:process_tasks).with(
          :ids    => [object.id],
          :task   => "cloud_object_store_object_delete",
          :userid => anything
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete")
      end

      it "flash - container no longer exists" do
        object.destroy
        expect { controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete") }.to raise_error("Can't access records without an id")
      end

      it "flash - task not supported" do
        controller.params[:id] = object.id.to_s
        allow_any_instance_of(CloudObjectStoreObject).to receive(:supports?).and_return(false)
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete")
        expect(assigns(:flash_array).first[:message]).to include(
          "Delete does not apply to this item"
        )
      end
    end
  end

  context "Delete object store object" do
    let :object1 do
      FactoryGirl.create(:cloud_object_store_object)
    end

    before do
      allow(controller).to receive(:assert_rbac).and_return(nil)
      controller.params[:pressed] = "cloud_object_store_object_delete"
      controller.params[:miq_grid_checks] = object1.id.to_s
      request.parameters["controller"] = "cloud_object_store_container"
      controller.instance_variable_set(:@display, "cloud_object_store_objects")
    end

    it "invokes delete for a selected CloudObjectStoreObject" do
      allow_any_instance_of(CloudObjectStoreObject).to receive(:supports?).and_return(true)
      controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete")
      expect(assigns(:flash_array).first[:message]).to include(
        "Delete initiated for 1 Cloud Object Store Object from the ManageIQ Database"
      )
    end

    it "flash - task not supported" do
      allow_any_instance_of(CloudObjectStoreObject).to receive(:supports?).and_return(false)
      controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_object_delete")
      expect(assigns(:flash_array).first[:message]).to include(
        "Delete does not apply to this item"
      )
    end
  end

  context "Clear object store container" do
    before do
      allow(controller).to receive(:assert_rbac).and_return(nil)
      allow_any_instance_of(CloudObjectStoreContainer).to receive(:supports?).and_return(true)
    end

    let :container1 do
      FactoryGirl.create(:cloud_object_store_container)
    end

    let :container2 do
      FactoryGirl.create(:cloud_object_store_container)
    end

    context "from list view" do
      before do
        controller.params[:pressed] = "cloud_object_store_container_clear"
        request.parameters["controller"] = "ems_storage"
        controller.instance_variable_set(:@display, "cloud_object_store_containers")
      end

      it "get_rec_cls" do
        expect(controller.send(:get_rec_cls)).to eq(CloudObjectStoreContainer)
      end

      it "invokes cloud_object_store_button_operation" do
        expect(controller).to receive(:cloud_object_store_button_operation).with(
          CloudObjectStoreContainer,
          'clear'
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_clear")
      end

      it "invokes process_objects" do
        controller.params[:miq_grid_checks] = "#{container1.id}, #{container2.id}"
        expect(controller).to receive(:process_objects).with(
          [container1.id, container2.id],
          'cloud_object_store_container_clear',
          'Clear'
        )
        controller.send(:cloud_object_store_button_operation, CloudObjectStoreContainer, 'clear')
      end

      it "invokes process_tasks on container class" do
        expect(CloudObjectStoreContainer).to receive(:process_tasks).with(
          :ids    => [container1.id, container2.id],
          :task   => 'cloud_object_store_container_clear',
          :userid => anything
        )
        controller.send(:process_objects, [container1.id, container2.id], 'cloud_object_store_container_clear',
                        'clear')
      end

      it "invokes process_tasks overall (when selected)" do
        controller.params[:miq_grid_checks] = "#{container1.id}, #{container2.id}"
        expect(CloudObjectStoreContainer).to receive(:process_tasks).with(
          :ids    => [container1.id, container2.id],
          :task   => 'cloud_object_store_container_clear',
          :userid => anything
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_clear")
      end

      it "does not invoke process_tasks overall when nothing selected" do
        controller.params[:miq_grid_checks] = ''
        expect(CloudObjectStoreContainer).not_to receive(:process_tasks)
        expect { controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_clear") }.to raise_error("Can't access records without an id")
      end

      it "flash - nothing selected" do
        controller.params[:miq_grid_checks] = ''
        expect { controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_clear") }.to raise_error("Can't access records without an id")
      end

      it "flash - task not supported" do
        controller.params[:miq_grid_checks] = "#{container1.id}, #{container2.id}"
        allow_any_instance_of(CloudObjectStoreContainer).to receive(:supports?).and_return(false)
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_clear")
        expect(assigns(:flash_array).first[:message]).to include(
          "Clear does not apply to at least one of the selected items"
        )
      end
    end

    context "from details view" do
      before do
        allow(controller).to receive(:show_list).and_return(nil)
        controller.params[:pressed] = "cloud_object_store_container_clear"
        request.parameters["controller"] = "cloud_object_store_container"
      end

      let :container do
        FactoryGirl.create(:cloud_object_store_container)
      end

      it "get_rec_cls" do
        expect(controller.send(:get_rec_cls)).to eq(CloudObjectStoreContainer)
      end

      it "invokes cloud_object_store_button_operation" do
        expect(controller).to receive(:cloud_object_store_button_operation).with(
          CloudObjectStoreContainer,
          'clear'
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_clear")
      end

      it "invokes process_objects" do
        controller.params[:id] = container.id
        expect(controller).to receive(:process_objects).with(
          [container.id],
          'cloud_object_store_container_clear',
          'Clear'
        )
        controller.send(:cloud_object_store_button_operation, CloudObjectStoreContainer, 'clear')
      end

      it "invokes process_tasks on container class" do
        expect(CloudObjectStoreContainer).to receive(:process_tasks).with(
          :ids    => [container.id],
          :task   => 'cloud_object_store_container_clear',
          :userid => anything
        )
        controller.send(:process_objects, [container.id], 'cloud_object_store_container_clear', 'clear')
      end

      it "invokes process_tasks overall" do
        controller.params[:id] = container.id
        expect(CloudObjectStoreContainer).to receive(:process_tasks).with(
          :ids    => [container.id],
          :task   => 'cloud_object_store_container_clear',
          :userid => anything
        )
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_clear")
      end

      it "flash - container no longer exists" do
        expect { controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_clear") }.to raise_error("Can't access records without an id")
      end

      it "flash - task not supported" do
        controller.params[:id] = container.id
        allow_any_instance_of(CloudObjectStoreContainer).to receive(:supports?).and_return(false)
        controller.send(:process_cloud_object_storage_buttons, "cloud_object_store_container_clear")
        expect(assigns(:flash_array).first[:message]).to include(
          "Clear does not apply to this item"
        )
      end
    end
  end

  # some methods should not be accessible through the legacy routes
  # either by being private or through the hide_action mechanism
  it 'should not allow call of hidden/private actions' do
    # dashboard/process_elements
    expect do
      post :process_elements
    end.to raise_error ActionController::UrlGenerationError
  end

  it "should set correct discovery title" do
    res = controller.send(:set_discover_title, "hosts", "host")
    expect(res).to eq("Hosts / Nodes")

    res = controller.send(:set_discover_title, "ems", "ems_infra")
    expect(res).to eq("Infrastructure Providers")

    res = controller.send(:set_discover_title, "ems", "ems_cloud")
    expect(res).to eq("Cloud Providers")
  end

  it "Certain actions should not be allowed for a MiqTemplate record" do
    template = FactoryGirl.create(:template_vmware)
    controller.instance_variable_set(:@_params, :id => template.id)
    actions = %i(vm_right_size vm_reconfigure)
    actions.each do |action|
      expect(controller).to receive(:render)
      controller.send(action)
      expect(controller.send(:flash_errors?)).to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("does not apply")
    end
  end

  it "Certain actions should be allowed only for a VM record" do
    feature = MiqProductFeature.find_all_by_identifier(["everything"])
    login_as FactoryGirl.create(:user, :features => feature)
    vm = FactoryGirl.create(:vm_vmware)
    controller.instance_variable_set(:@_params, :id => vm.id)
    actions = %i(vm_right_size vm_reconfigure)
    actions.each do |action|
      expect(controller).to receive(:render)
      controller.send(action)
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end
  end

  context "Verify the reconfigurable flag for VMs" do
    it "Reconfigure VM action should be allowed only for a VM marked as reconfigurable" do
      vm = FactoryGirl.create(:vm_vmware)
      controller.instance_variable_set(:@_params, :id => vm.id)
      record = controller.send(:get_record, "vm")
      action = :vm_reconfigure
      expect(controller).to receive(:render)
      controller.send(action)
      unless record.reconfigurable?
        expect(controller.send(:flash_errors?)).to be_truthy
        expect(assigns(:flash_array).first[:message]).to include("does not apply")
      end
    end
    it "Reconfigure VM action should not be allowed for a VM marked as reconfigurable" do
      vm = FactoryGirl.create(:vm_microsoft)
      controller.instance_variable_set(:@_params, :id => vm.id)
      record = controller.send(:get_record, "vm")
      action = :vm_reconfigure
      expect(controller).to receive(:render)
      controller.send(action)
      unless record.reconfigurable?
        expect(controller.send(:flash_errors?)).to be_truthy
        expect(assigns(:flash_array).first[:message]).to include("does not apply")
      end
    end
  end

  describe "#supports_reconfigure_disks?" do
    let(:vm) { FactoryGirl.create(:vm_redhat) }

    context "when a single is vm selected" do
      let(:supports_reconfigure_disks) { true }
      before(:each) do
        allow(vm).to receive(:supports_reconfigure_disks?).and_return(supports_reconfigure_disks)
        controller.instance_variable_set(:@reconfigitems, [vm])
      end

      context "when vm supports reconfiguring disks" do
        it "enables reconfigure disks" do
          expect(controller.send(:supports_reconfigure_disks?)).to be_truthy
        end
      end
      context "when vm does not supports reconfiguring disks" do
        let(:supports_reconfigure_disks) { false }
        it "disables reconfigure disks" do
          expect(controller.send(:supports_reconfigure_disks?)).to be_falsey
        end
      end
    end

    context "when multiple vms selected" do
      let(:vm1) { FactoryGirl.create(:vm_redhat) }
      it "disables reconfigure disks" do
        controller.instance_variable_set(:@reconfigitems, [vm, vm1])
        expect(controller.send(:supports_reconfigure_disks?)).to be_falsey
      end
    end
  end

  describe "#discover" do
    it "checks that keys in @to remain set if there is an error after submit is pressed" do
      from_first = "1"
      from_second = "1"
      from_third = "1"
      controller.instance_variable_set(:@_params,
                                       :from_first                   => from_first,
                                       :from_second                  => from_second,
                                       :from_third                   => from_third,
                                       :from_fourth                  => "1",
                                       :to_fourth                    => "0",
                                       "discover_type_virtualcenter" => "1",
                                       "start"                       => "45")
      allow(controller).to receive(:drop_breadcrumb)
      expect(controller).to receive(:render)
      controller.send(:discover)
      to = assigns(:to)
      expect(to[:first]).to eq(from_first)
      expect(to[:second]).to eq(from_second)
      expect(to[:third]).to eq(from_third)
      expect(controller.send(:flash_errors?)).to be_truthy
    end
  end

  describe "#process_elements" do
    it "shows passed in display name in flash message" do
      pxe = FactoryGirl.create(:pxe_server)
      controller.send(:process_elements, [pxe.id], PxeServer, 'synchronize_advertised_images_queue', 'Refresh Relationships')
      expect(assigns(:flash_array).first[:message]).to include("Refresh Relationships successfully initiated")
    end

    it "shows task name in flash message when display name is not passed in" do
      pxe = FactoryGirl.create(:pxe_server)
      controller.send(:process_elements, [pxe.id], PxeServer, 'synchronize_advertised_images_queue')
      expect(assigns(:flash_array).first[:message])
        .to include("synchronize_advertised_images_queue successfully initiated")
    end
  end

  describe "#identify_record" do
    it "Verify flash error message when passed in ID no longer exists in database" do
      record = controller.send(:identify_record, "1", ExtManagementSystem)
      expect(record).to be_nil
      expect(assigns(:bang).message).to match(/Can't access selected records/)
    end

    it "Verify @record is set for passed in ID" do
      ems = FactoryGirl.create(:ext_management_system)
      record = controller.send(:identify_record, ems.id, ExtManagementSystem)
      expect(record).to be_a_kind_of(ExtManagementSystem)
    end
  end

  describe "#get_record" do
    it "use passed in db to set class for identify_record call" do
      host = FactoryGirl.create(:host)
      controller.instance_variable_set(:@_params, :id => host.id)
      record = controller.send(:get_record, "host")
      expect(record).to be_a_kind_of(Host)
    end
  end

  describe "#build_ownership_info" do
    let(:child_role)                     { FactoryGirl.create(:miq_user_role, :name => "Role_1") }
    let(:grand_child_tenant_role)        { FactoryGirl.create(:miq_user_role, :name => "Role_2") }
    let(:great_grand_child_tenant_role)  { FactoryGirl.create(:miq_user_role, :name => "Role_3") }

    let(:child_tenant)             { FactoryGirl.create(:tenant) }
    let(:grand_child_tenant)       { FactoryGirl.create(:tenant, :parent => child_tenant) }
    let(:great_grand_child_tenant) { FactoryGirl.create(:tenant, :parent => grand_child_tenant) }

    let(:child_group) do
      FactoryGirl.create(:miq_group, :description => "Child group", :role => child_role, :tenant => child_tenant)
    end

    let(:grand_child_group) do
      FactoryGirl.create(:miq_group, :description => "Grand child group", :role => grand_child_tenant_role,
                                     :tenant => grand_child_tenant)
    end

    let(:great_grand_child_group) do
      FactoryGirl.create(:miq_group, :description => "Great Grand Child group", :role => great_grand_child_tenant_role,
                                     :tenant => great_grand_child_tenant)
    end
    let(:admin_user) { FactoryGirl.create(:user_admin) }

    it "lists all non-tenant groups when (admin user is logged)" do
      @vm_or_template = FactoryGirl.create(:vm_or_template)
      @ownership_items = [@vm_or_template.id]
      login_as(admin_user)
      controller.instance_variable_set(:@_params, :controller => 'vm_or_template')
      controller.instance_variable_set(:@user, nil)

      controller.build_ownership_info(@ownership_items)
      groups = controller.instance_variable_get(:@groups)
      expect(groups.count).to eq(MiqGroup.non_tenant_groups.count)
    end
  end
end

describe HostController do
  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.create(:zone) }

  describe "#show_association" do
    before(:each) do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @host = FactoryGirl.create(:host)
      @guest_application = FactoryGirl.create(:guest_application, :name => "foo", :host_id => @host.id)
      @datastore = FactoryGirl.create(:storage, :name => 'storage_name')
      @datastore.parent = @host
    end

    it "renders show_item" do
      controller.instance_variable_set(:@breadcrumbs, [])
      allow(controller).to receive(:get_view)
      get :guest_applications, :params => { :id => @host.id, :show => @guest_application.id }
      expect(response.status).to eq(200)
      expect(response).to render_template('host/show')
      expect(assigns(:breadcrumbs)).to eq([{:name => "#{@host.name} (Packages)",
                                            :url  => "/host/guest_applications/#{@host.id}?page="},
                                           {:name => "foo",
                                            :url  => "/host/guest_applications/#{@host.id}?show=#{@guest_application.id}"}])
    end

    it "shows associated datastores" do
      controller.instance_variable_set(:@breadcrumbs, [])
      get :show, :params => {:id => @host.id, :display => 'storages'}
      expect(response.status).to eq(200)
      expect(response).to render_template('host/show')
      expect(assigns(:breadcrumbs)).to eq([{:name => "#{@host.name} (All Datastores)",
                                            :url  => "/host/show/#{@host.id}?display=storages"}])
    end

    it "renders show_details" do
      controller.instance_variable_set(:@breadcrumbs, [])
      allow(controller).to receive(:get_view)
      get :guest_applications, :params => { :id => @host.id }
      expect(response.status).to eq(200)
      expect(response).to render_template('host/show')
      expect(assigns(:breadcrumbs)).to eq([{:name => "#{@host.name} (Packages)",
                                            :url  => "/host/guest_applications/#{@host.id}"}])
    end

    it "plularizes breadcrumb name" do
      expect(controller.send(:breadcrumb_name, nil)).to eq("Hosts")
    end
  end

  describe "#process_objects" do
    it "returns array of object ids " do
      vm1 = FactoryGirl.create(:vm_vmware)
      vm2 = FactoryGirl.create(:vm_vmware)
      vm3 = FactoryGirl.create(:vm_vmware)
      vms = [vm1.id, vm2.id, vm3.id]
      controller.send(:process_objects, vms, 'refresh_ems', 'Refresh Provider')
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include "Refresh Provider initiated for #{vms.length} VMs"
    end
  end

  describe "#process_hosts" do
    before do
      @host1 = FactoryGirl.create(:host)
      @host2 = FactoryGirl.create(:host)
      allow(controller).to receive(:filter_ids_in_region).and_return([[@host1, @host2], nil])
    end

    it "initiates host destroy" do
      controller.send(:process_hosts, [@host1], 'destroy')
      audit_event = AuditEvent.all.first
      task = MiqQueue.find_by(:class_name => "Host")
      expect(audit_event['message']).to include "Record delete initiated"
      expect(task.method_name).to eq 'destroy'
    end

    it "initiates refresh for selected hosts" do
      controller.send(:process_hosts, [@host1, @host2], 'refresh_ems')
      audit_event = AuditEvent.all.first
      MiqQueue.find_by(:class_name => "Host")
      expect(audit_event['message']).to include "'Refresh Provider' successfully initiated for 2 Hosts"
    end
  end

  describe "#generic_button_operation" do
    before(:each) do
      allow(subject).to receive(:vm_button_action).and_return(subject.method(:process_objects))
      allow(controller).to receive(:render)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    it "when the vm_or_template supports scan,  returns false" do
      vm1 =  FactoryGirl.create(:vm_microsoft)
      vm2 =  FactoryGirl.create(:vm_vmware)
      controller.instance_variable_set(:@_params, :miq_grid_checks => "#{vm1.id}, #{vm2.id}")
      controller.send(:generic_button_operation,
                      'scan',
                      "Smartstate Analysis",
                      subject.send(:vm_button_action))
      expect(assigns(:flash_array).first[:message]).to \
        include("Smartstate Analysis action does not apply to selected items")
    end

    it "when the vm_or_template supports scan,  returns true" do
      vm = FactoryGirl.create(:vm_vmware,
                              :ext_management_system => FactoryGirl.create(:ems_openstack_infra),
                              :storage               => FactoryGirl.create(:storage))
      controller.instance_variable_set(:@_params, :miq_grid_checks => vm.id.to_s)
      process_proc = controller.send(:vm_button_action)
      expect(process_proc).to receive(:call)
      controller.send(:generic_button_operation,
                      'scan',
                      "Smartstate Analysis",
                      process_proc)
    end
  end
end

describe ServiceController do
  describe "#vm_button_operation" do
    let(:user) { FactoryGirl.create(:user_admin) }

    before do
      _guid, @miq_server, @zone = EvmSpecHelper.remote_guid_miq_server_zone
      allow(MiqServer).to receive(:my_zone).and_return("default")
      allow(MiqServer).to receive(:my_server) { FactoryGirl.create(:miq_server) }
      controller.instance_variable_set(:@lastaction, "show_list")
      login_as user
      allow(user).to receive(:role_allows?).and_return(true)
    end

    it "should continue to retire a service and does not render flash message 'xxx does not apply xxx' " do
      service = FactoryGirl.create(:service)
      template = FactoryGirl.create(:template,
                                    :ext_management_system => FactoryGirl.create(:ems_openstack_infra),
                                    :storage               => FactoryGirl.create(:storage))
      service.update_attribute(:id, template.id)
      service.reload
      controller.instance_variable_set(:@_params, :miq_grid_checks => service.id.to_s)
      expect(controller).to receive(:show_list)
      process_proc = controller.send(:vm_button_action)
      controller.send(:generic_button_operation, 'retire_now', "Retirement", process_proc)
      expect(response.status).to eq(200)
      expect(assigns(:flash_array).first[:message]).to \
        include("Retirement initiated for 1 Service from the %{product} Database" % {:product => Vmdb::Appliance.PRODUCT_NAME})
    end
  end
end

describe MiqTemplateController do
  describe "#vm_button_operation" do
    before do
      _guid, @miq_server, @zone = EvmSpecHelper.remote_guid_miq_server_zone
      allow(MiqServer).to receive(:my_zone).and_return("default")
      controller.instance_variable_set(:@lastaction, "show_list")
    end

    it "should continue to set ownership for a template" do
      allow(controller).to receive(:role_allows?).and_return(true)
      allow(controller).to receive(:drop_breadcrumb)
      template = FactoryGirl.create(:template,
                                    :ext_management_system => FactoryGirl.create(:ems_openstack_infra),
                                    :storage               => FactoryGirl.create(:storage))
      controller.instance_variable_set(:@_params,
                                       :miq_grid_checks => template.id.to_s,
                                       :pressed         => 'miq_template_set_ownership')
      expect(controller).to receive(:javascript_redirect).with(:controller => "miq_template",
                                                               :action     => 'ownership',
                                                               :rec_ids    => [template.id],
                                                               :escape     => false)
      controller.send('set_ownership')
    end
  end
end

describe VmOrTemplateController do
  describe "#vm_button_operation" do
    let(:user) { FactoryGirl.create(:user_admin) }

    before do
      _guid, @miq_server, @zone = EvmSpecHelper.remote_guid_miq_server_zone
      allow(MiqServer).to receive(:my_zone).and_return("default")
      allow(MiqServer).to receive(:my_server) { FactoryGirl.create(:miq_server) }
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@lastaction, "show_list")
      login_as user
      allow(user).to receive(:role_allows?).and_return(true)
    end

    it "should render flash message when trying to retire a template" do
      vm = FactoryGirl.create(
        :vm_vmware,
        :ext_management_system => FactoryGirl.create(:ems_openstack_infra),
        :storage               => FactoryGirl.create(:storage)
      )
      template = FactoryGirl.create(
        :template,
        :ext_management_system => FactoryGirl.create(:ems_openstack_infra),
        :storage               => FactoryGirl.create(:storage)
      )
      controller.instance_variable_set(:@_params, :miq_grid_checks => "#{vm.id}, #{template.id}")
      process_proc = controller.send(:vm_button_action)
      redirect_details = {
        :redirect => {
          :controller => 'miq_request',
          :action => 'show_list'
        }
      }
      controller.send(:generic_button_operation, 'retire_now', "Retirement", process_proc, redirect_details)
      expect(assigns(:flash_array).first[:message]).to \
        include("Retirement action does not apply to selected items")
    end

    it "should continue to retire a vm" do
      vm = FactoryGirl.create(
        :vm_vmware,
        :ext_management_system => FactoryGirl.create(:ems_openstack_infra),
        :storage               => FactoryGirl.create(:storage)
      )

      controller.instance_variable_set(:@_params, :miq_grid_checks => vm.id.to_s)
      expect(controller).to receive(:show_list)
      process_proc = controller.send(:vm_button_action)
      controller.send(:generic_button_operation, 'retire_now', "Retirement", process_proc)
      expect(response.status).to eq(200)
      expect(assigns(:flash_array).first[:message]).to \
        include("Retirement initiated for 1 VM and Instance from the %{product} Database" % {:product => Vmdb::Appliance.PRODUCT_NAME})
    end
  end
end

describe OrchestrationStackController do
  describe "#orchestration_stack_delete" do
    let(:orchestration_stack) { FactoryGirl.create(:orchestration_stack_cloud) }
    let(:orchestration_stack_deleted) { FactoryGirl.create(:orchestration_stack_cloud) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user_admin)
      controller.instance_variable_set(:@lastaction, "show_list")
      allow(controller).to receive(:role_allows?).and_return(true)
    end

    it "should render error flash message if OrchestrationStack doesn't exist" do
      id = orchestration_stack_deleted.id
      orchestration_stack_deleted.destroy
      controller.instance_variable_set(:@_params, :miq_grid_checks => id.to_s) # Orchestration Stack id that doesn't exist
      expect(controller).to receive(:show_list)
      controller.send('orchestration_stack_delete')
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first).to eq(:message => "Error during deletion: Can't access selected records",
                                         :level   => :error)
    end

    it "should render success flash message if OrchestrationStack deletion was initiated" do
      controller.instance_variable_set(:@_params, :miq_grid_checks => orchestration_stack.id.to_s) # Orchestration Stack id that exists
      expect(controller).to receive(:show_list)
      controller.send('orchestration_stack_delete')
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first).to eq(:message => "Delete initiated for 1 Orchestration Stacks from the ManageIQ Database",
                                         :level   => :success)
    end
  end
end

describe EmsCloudController do
  describe "#delete_flavor" do
    let!(:flavor) { FactoryGirl.create(:flavor) }
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      stub_user(:features => :all)
    end

    context 'when pressed' do
      it 'queues deletion of selected flavors' do
        controller.instance_variable_set(
          :@_params,
          :miq_grid_checks => "#{flavor.id}")
        expect(controller).to receive(:delete_flavors).and_call_original
        expect_any_instance_of(Flavor).to receive(:delete_flavor_queue)
        post :button, :params => {:pressed => 'flavor_delete', :miq_grid_checks => flavor.id}
      end
    end
  end
end

describe VmInfraController do
  describe '#testable_action' do
    before do
      controller.instance_variable_set(:@_params, :controller => 'vm_infra')
    end

    context 'power operations and vm infra controller' do
      %w(reboot_guest reset shutdown_guest start stop suspend).each do |op|
        it "returns true for #{op} operation on a VM" do
          expect(controller.send(:testable_action, op)).to be(true)
        end
      end
    end
  end
end
