describe OpsController do
  let(:params) { {} }
  let(:session) { {} }

  include_context "valid session"

  describe "#schedule_form_filter_type_field_changed" do
    before do
      params[:filter_type] = filter_type
      params[:id] = "123"
    end

    context "when the filter_type is 'vm'" do
      let(:vm) { FactoryBot.create(:vm_vmware, :name => "vmtest") }
      let(:filter_type) { "vm" }

      before do
        allow(Vm).to receive(:find).with(:all, {}).and_return([vm])
        post :schedule_form_filter_type_field_changed, :params => params, :session => session
      end

      it "responds with a filtered vm list" do
        json = JSON.parse(response.body)
        expect(json["filtered_item_list"]).to eq(["vmtest"])
      end
    end

    context "when the filter_type is 'ems'" do
      let(:ext_management_system) { FactoryBot.create(:ext_management_system) }
      let(:filter_type) { "ems" }

      before do
        allow(ExtManagementSystem).to receive(:find).with(:all, {}).and_return([ext_management_system])
        post :schedule_form_filter_type_field_changed, :params => params, :session => session
      end

      it "responds with a filtered ext management system list" do
        json = JSON.parse(response.body)
        expect(json["filtered_item_list"]).to eq([ext_management_system.name])
      end
    end

    context "when the filter_type is 'cluster'" do
      let(:cluster) do
        FactoryBot.create(
          :ems_cluster,
          :name => "clustertest"
        )
      end
      let(:filter_type) { "cluster" }

      before do
        cluster.parent = FactoryBot.create(:datacenter, :name => "datacenter")
        bypass_rescue
        allow(EmsCluster).to receive(:find).with(:all, {}).and_return([cluster])
        post :schedule_form_filter_type_field_changed, :params => params, :session => session
      end

      it "responds with a filtered cluster list" do
        json = JSON.parse(response.body)
        expect(json["filtered_item_list"]).to eq([['clustertest__datacenter', 'clustertest in datacenter']])
      end
    end

    context "when the filter_type is 'host'" do
      let(:host) { FactoryBot.create(:host, :name => "hosttest") }
      let(:filter_type) { "host" }

      before do
        allow(Host).to receive(:find).with(:all, {}).and_return([host])
        post :schedule_form_filter_type_field_changed, :params => params, :session => session
      end

      it "responds with a filtered host list" do
        json = JSON.parse(response.body)
        expect(json["filtered_item_list"]).to eq(["hosttest"])
      end
    end
  end
  context "#build_uri_settings" do
    let(:mocked_filedepot) { double(FileDepotSmb) }
    it "uses params[:log_password] for validation if one exists" do
      controller.params = {:log_userid   => "userid",
                           :log_password => "password2",
                           :uri_prefix   => "smb",
                           :uri          => "samba_uri",
                           :log_protocol => "Samba"}
      settings = {:username   => "userid",
                  :password   => "password2",
                  :uri        => "smb://samba_uri",
                  :uri_prefix => "smb"}
      expect(controller.send(:build_uri_settings, :mocked_filedepot)).to include(settings)
    end

    it "uses the stored password for validation if params[:log_password] does not exist" do
      controller.params = {:log_userid   => "userid",
                           :uri_prefix   => "smb",
                           :uri          => "samba_uri",
                           :log_protocol => "Samba"}
      expect(mocked_filedepot).to receive(:try).with(:authentication_password).and_return('password')
      settings = {:username   => "userid",
                  :password   => "password",
                  :uri        => "smb://samba_uri",
                  :uri_prefix => "smb"}
      expect(controller.send(:build_uri_settings, mocked_filedepot)).to include(settings)
    end
  end

  context "#schedule_set_record_vars" do
    let(:user) { stub_user(:features => :all) }
    let(:schedule) { FactoryBot.create(:miq_automate_schedule) }
    let(:vm) { FactoryBot.create(:vm_vmware) }

    before do
      EvmSpecHelper.local_miq_server
      stub_user(:features => :all)
    end

    it "returns automate parameters for an automation_request" do
      params[:action_typ] = "automation_request"
      filter_params = {
        :starting_object => "SYSTEM/PROCESS",
        :instance_name   => "test",
        :object_request  => "Request",
        :ui_attrs        => {"0"=>%w(key1 value1)},
        :target_class    => vm.class.name.to_s,
        :target_id       => vm.id.to_s
      }
      params.merge!(filter_params)
      allow(controller).to receive(:params).and_return(params)
      set_vars = controller.send(:schedule_set_record_vars, schedule)
      expect(set_vars[:parameters]).to include(:request => filter_params[:object_request], "key1" => "value1", "VmOrTemplate::vm" => vm.id)
      expect(set_vars[:uri_parts]).to include(:namespace => filter_params[:starting_object])
    end

    it "sets proper filter values for 'container_image_check_compliance' action type" do
      params[:action_typ] = "container_image_check_compliance"

      allow(controller).to receive(:params).and_return(params)
      controller.send(:schedule_set_record_vars, schedule)
      key = schedule.filter.exp.keys.first
      expect(schedule.filter.exp[key]["field"]).to eq("ContainerImage-name")
      expect(schedule.sched_action).to eq(:method=>"check_compliance")
    end

    it "sets proper filter values for 'vm_check_compliance' action type" do
      params[:action_typ] = "vm_check_compliance"

      allow(controller).to receive(:params).and_return(params)
      controller.send(:schedule_set_record_vars, schedule)
      key = schedule.filter.exp.keys.first
      expect(schedule.filter.exp[key]["field"]).to eq("Vm-name")
      expect(schedule.sched_action).to eq(:method=>"check_compliance")
    end

    it "sets start time correctly" do
      params[:start_date] = "Mon Mar 12 2018 20:00:00 GMT-0400 (EDT)"
      params[:start_hour] = "1"
      params[:start_min]  = "5"
      params[:time_zone]  = "UTC"

      allow(controller).to receive(:params).and_return(params)
      controller.send(:schedule_set_start_time_record_vars, schedule)
      expect(schedule.run_at[:start_time]).to eq("2018-03-12 01:05:00 UTC")
    end
  end

  context "#build_attrs_from_params" do
    let(:user) { stub_user(:features => :all) }
    let(:vm) { FactoryBot.create(:vm_vmware) }

    before do
      EvmSpecHelper.local_miq_server
      stub_user(:features => :all)
    end

    it "correctly formats Automate objects for parsing by the Automate engine" do
      filter_params = {
        :target_class => vm.class.name.to_s,
        :target_id    => vm.id.to_s
      }
      params.merge!(filter_params)
      allow(controller).to receive(:params).and_return(params)
      automate_vars = controller.send(:build_attrs_from_params, params)
      expect(automate_vars).to eq "VmOrTemplate::vm"=>vm.id
    end

    it "returns an empty hash if no target class is passed in" do
      filter_params = {
        :target_class => {},
        :target_id    => vm.id.to_s
      }
      params.merge!(filter_params)
      allow(controller).to receive(:params).and_return(params)
      automate_vars = controller.send(:build_attrs_from_params, params)
      expect(automate_vars).to be_empty
    end
  end

  context "#build_filtered_item_list" do
    settings = {}
    it "returns a filtered item list for MiqTemplate" do
      controller.instance_variable_set(:@settings, settings)
      current_user = FactoryBot.create(:user)
      search = FactoryBot.create(:miq_search, :db => "MiqTemplate", :search_type => "default")
      allow(controller).to receive(:current_user).and_return(current_user)
      filtered_list = controller.send(:build_filtered_item_list, "miq_template", "global")
      expect(filtered_list).to include([search.id, search.description])
    end

    it "returns a filtered item list for Datastore" do
      controller.instance_variable_set(:@settings, settings)
      current_user = FactoryBot.create(:user)
      search = FactoryBot.create(:miq_search, :db => "Storage", :search_type => "default")
      allow(controller).to receive(:current_user).and_return(current_user)
      filtered_list = controller.send(:build_filtered_item_list, "storage", "global")
      expect(filtered_list).to include([search.id, search.description])
    end

    it "returns a filtered item list for a single Datastore" do
      controller.instance_variable_set(:@settings, settings)
      storage = FactoryBot.create(:storage_vmware)
      filtered_list = controller.send(:build_filtered_item_list, "storage", "storage")
      expect(filtered_list.first).to include(storage.name)
    end

    it "returns a filtered item list for ems providers that have hosts" do
      controller.instance_variable_set(:@settings, settings)
      ems_cloud = FactoryBot.create(:ems_cloud)
      ems_infra_no_hosts = FactoryBot.create(:ems_openstack_infra)
      ems_infra_with_hosts = FactoryBot.create(:ems_openstack_infra_with_stack)
      filtered_list = controller.send(:build_filtered_item_list, "host", "ems")
      expect(filtered_list).not_to include(ems_cloud.name)
      expect(filtered_list).not_to include(ems_infra_no_hosts.name)
      expect(filtered_list.first).to include(ems_infra_with_hosts.name)
    end
  end
end
