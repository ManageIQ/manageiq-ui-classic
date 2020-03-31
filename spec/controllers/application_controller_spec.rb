require 'ostruct'

describe ApplicationController do
  describe "#report_only" do
    let(:group) { FactoryBot.create(:miq_group, :miq_user_role => FactoryBot.create(:miq_user_role)) }
    let(:user)  { FactoryBot.create(:user, :miq_groups => [group]) }
    let(:report_title) { "VMs using thin provisioned disks" }
    let(:report) { FactoryBot.create(:miq_report, :title => report_title) }
    let(:report_result_for_report) { FactoryBot.create(:miq_report_result, :miq_group => group, :miq_report_id => report.id, :report => report) }
    let(:widget_title) { "Widget: VMs using thin provisioned disks" }
    let(:widget) { FactoryBot.create(:miq_widget, :widget => widget_title) }
    let(:widget_content) { FactoryBot.create(:miq_widget_content, :miq_widget => widget) }
    let(:report_for_widget) { FactoryBot.create(:miq_report, :title => widget_title) }
    let(:report_result_for_widget) { FactoryBot.create(:miq_report_result, :miq_group => group, :miq_report => report_for_widget, :report => report_for_widget, :report_source => MiqWidget::WIDGET_REPORT_SOURCE) }

    before do
      login_as user
    end

    it "uses correct variables for rendering result of report" do
      controller.instance_variable_set(:@sb, :pages => { :rr_id => report_result_for_report.id })
      controller.params = {:rr_id => report_result_for_report.id}

      expect(controller).to receive(:render).with('shared/show_report', :layout => 'report_only')
      controller.send(:report_only)

      expect(controller.instance_variable_get(:@report_title)).to eq(report_title)
      expect(controller.instance_variable_get(:@report)).to eq(report)
      expect(controller.instance_variable_get(:@ght_type)).to eq('tabular')
      expect(controller.instance_variable_get(:@render_chart)).to be_falsey
    end

    it "uses correct variables for rendering result of report" do
      controller.instance_variable_set(:@sb, :pages => { :rr_id => report_result_for_widget.id })
      controller.params = {:rr_id => report_result_for_widget.id}

      expect(controller).to receive(:render).with('shared/show_report', :layout => 'report_only')
      controller.send(:report_only)

      expect(controller.instance_variable_get(:@report_title)).to eq(widget_title)
      expect(controller.instance_variable_get(:@report)).to eq(report_for_widget)
      expect(controller.instance_variable_get(:@ght_type)).to eq('tabular')
      expect(controller.instance_variable_get(:@render_chart)).to be_falsey
    end
  end

  describe "#find_record_with_rbac" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      controller.instance_variable_set(:@sb, {})
      ur = FactoryBot.create(:miq_user_role)
      rptmenu = {:report_menus => [["Configuration Management", ["Hosts", ["Hosts Summary", "Hosts Summary"]]]]}
      group = FactoryBot.create(:miq_group, :miq_user_role => ur, :settings => rptmenu)
      login_as FactoryBot.create(:user, :miq_groups => [group])
    end

    it "Verify Invalid input flash error message when invalid id is passed in" do
      expect { controller.send(:find_record_with_rbac, ExtManagementSystem, "invalid") }.to raise_error(ActiveRecord::RecordNotFound, "Can't access selected records")
    end

    it "Verify flash error message when passed in id no longer exists in database" do
      expect { controller.send(:find_record_with_rbac, ExtManagementSystem, "1") }.to raise_error(ActiveRecord::RecordNotFound, match(/Can't access selected records/))
    end

    it "Verify record gets set when valid id is passed in" do
      ems = FactoryBot.create(:ext_management_system)
      expect(controller.send(:find_record_with_rbac, ExtManagementSystem, ems.id)).to eq(ems)
    end
  end

  describe "#assert_privileges" do
    before do
      EvmSpecHelper.seed_specific_product_features("host_compare", "host_edit", "perf_reload")
      feature = MiqProductFeature.find_all_by_identifier(["host_compare"])
      login_as FactoryBot.create(:user, :features => feature)
    end

    it "should not raise an error for feature that user has access to" do
      expect { controller.send(:assert_privileges, "host_compare") }.not_to raise_error
    end

    it "should raise an error for feature that user does not have access to" do
      msg = "The user is not authorized for this task or item."
      expect { controller.send(:assert_privileges, "host_edit") }.to raise_error(MiqException::RbacPrivilegeException, msg)
    end

    it "should not raise an error for common hidden feature under a hidden parent" do
      expect { controller.send(:assert_privileges, "perf_reload") }.not_to raise_error
    end
  end

  describe "#previous_breadcrumb_url" do
    it "should return url when 2 entries" do
      controller.instance_variable_set(:@breadcrumbs, [{:url => "test_url"}, 'placeholder'])
      expect(controller.send(:previous_breadcrumb_url)).to eq("test_url")
    end

    it "should raise for less than 2 entries" do
      controller.instance_variable_set(:@breadcrumbs, [{}])
      expect { controller.send(:previous_breadcrumb_url) }.to raise_error(NoMethodError)

      controller.instance_variable_set(:@breadcrumbs, [])
      expect { controller.send(:previous_breadcrumb_url) }.to raise_error(NoMethodError)
    end
  end

  describe '#last_screen_url' do
    it 'returns the last url' do
      controller.instance_variable_set(:@breadcrumbs, [{:url => 'previous_url'}, {:url => 'last_url'}])
      expect(controller.send(:last_screen_url)).to eq('last_url')
    end

    it 'raises error' do
      controller.instance_variable_set(:@breadcrumbs, [])
      expect { controller.send(:previous_breadcrumb_url) }.to raise_error(NoMethodError)
    end
  end

  describe "#find_checked_items" do
    it "returns empty array when button is pressed from summary screen with params as symbol" do
      controller.params = {:id => "1"}
      expect(controller.send(:find_checked_items)).to eq([])
    end

    it "returns empty array when button is pressed from summary screen with params as string" do
      controller.params = {"id" => "1"}
      expect(controller.send(:find_checked_items)).to eq([])
    end

    it "returns list of items selected from list view" do
      controller.params = {:miq_grid_checks => "1, 2, 3, 4"}
      expect(controller.send(:find_checked_items)).to eq([1, 2, 3, 4])
    end
  end

  describe "#render_gtl_view_tb?" do
    before do
      controller.instance_variable_set(:@layout, "host")
      controller.instance_variable_set(:@gtl_type, "list")
    end

    it "returns true for list views" do
      controller.params = {:action => "show_list"}
      expect(controller.send(:render_gtl_view_tb?)).to be_truthy
    end

    it "returns true for list views when navigating thru relationships" do
      controller.params = {:action => "show"}
      expect(controller.send(:render_gtl_view_tb?)).to be_truthy
    end

    it "returns false for sub list views" do
      controller.params = {:action => "host_services"}
      expect(controller.send(:render_gtl_view_tb?)).to be_falsey
    end
  end

  describe "#prov_redirect" do
    let(:user) { FactoryBot.create(:user, :features => "vm_migrate") }
    before do
      allow(User).to receive(:server_timezone).and_return("UTC")
      login_as user
      controller.request.parameters[:pressed] = "vm_migrate"
    end

    it "returns flash message when Migrate button is pressed with list containing SCVMM VM" do
      vm1 = FactoryBot.create(:vm_vmware)
      vm2 = FactoryBot.create(:vm_microsoft)
      controller.params = {:pressed         => "vm_migrate",
                           :miq_grid_checks => "#{vm1.id},#{vm2.id}"}
      controller.set_response!(response)
      controller.send(:prov_redirect, "migrate")
      expect(assigns(:flash_array).first[:message]).to include("does not apply to at least one of the selected")
    end

    let(:ems)     { FactoryBot.create(:ext_management_system) }
    let(:storage) { FactoryBot.create(:storage) }

    it "sets variables when Migrate button is pressed with list of VMware VMs" do
      vm1 = FactoryBot.create(:vm_vmware, :storage => storage, :ext_management_system => ems)
      vm2 = FactoryBot.create(:vm_vmware, :storage => storage, :ext_management_system => ems)
      controller.params = {:pressed         => "vm_migrate",
                           :miq_grid_checks => "#{vm1.id},#{vm2.id}"}
      controller.set_response!(response)
      controller.send(:prov_redirect, "migrate")
      expect(controller.send(:flash_errors?)).to be_falsey
      expect(assigns(:org_controller)).to eq("vm")
    end
  end

  describe "#prov_redirect" do
    before do
      login_as FactoryBot.create(:user, :features => "image_miq_request_new")
      allow(User).to receive(:server_timezone).and_return("UTC")
      controller.request.parameters[:pressed] = "image_miq_request_new"
      controller.instance_variable_set(:@explorer, true)
    end

    it "returns flash message when Provisioning button is pressed from list and selected Image is archived" do
      template = FactoryBot.create(:miq_template,
                                    :name     => "template 1",
                                    :vendor   => "vmware",
                                    :location => "template1.vmtx")
      controller.params = {:pressed         => "image_miq_request_new",
                           :miq_grid_checks => template.id.to_s}
      controller.set_response!(response)
      expect(controller).not_to receive(:vm_pre_prov)
      controller.send(:prov_redirect)
      expect(assigns(:flash_array).first[:message]).to include("does not apply to at least one of the selected")
    end

    let(:ems)     { FactoryBot.create(:ems_openstack) }
    let(:storage) { FactoryBot.create(:storage) }

    it "sets provisioning data and skips pre provisioning dialog" do
      template = FactoryBot.create(:template_openstack,
                                    :name                  => "template 1",
                                    :vendor                => "vmware",
                                    :location              => "template1.vmtx",
                                    :ext_management_system => ems)
      controller.params = {:pressed         => "image_miq_request_new",
                           :miq_grid_checks => template.id.to_s}
      controller.instance_variable_set(:@breadcrumbs, [])
      controller.instance_variable_set(:@sb, {})
      controller.set_response!(response)
      expect(controller).to receive(:vm_pre_prov)
      expect(controller).not_to receive(:build_vm_grid)
      allow(controller).to receive(:replace_right_cell)
      controller.send(:prov_redirect)
      expect(controller.send(:flash_errors?)).to be_falsey
      expect(assigns(:org_controller)).to eq("vm")
    end

    context 'setting proper template klass type for various controllers' do
      subject { controller.instance_variable_get(:@template_klass_type) }

      %w(ems_cluster ems_infra host resource_pool storage vm_infra).each do |ctrl|
        context "#{ctrl} controller" do
          before do
            allow(controller).to receive(:assert_privileges)
            allow(controller).to receive(:performed?)
            allow(controller).to receive(:template_types_for_controller).and_call_original
            allow(request).to receive(:parameters).and_return(:controller => ctrl, :pressed => 'vm_miq_request_new')
          end

          it 'returns proper template type while provisioning VMs' do
            controller.send(:prov_redirect)
            expect(subject).to eq('infra')
          end
        end
      end

      %w(auth_key_pair_cloud availability_zone cloud_tenant ems_cloud host_aggregate orchestration_stack vm_cloud).each do |ctrl|
        context "#{ctrl} controller" do
          before do
            allow(controller).to receive(:assert_privileges)
            allow(controller).to receive(:performed?)
            allow(controller).to receive(:template_types_for_controller).and_call_original
            allow(request).to receive(:parameters).and_return(:controller => ctrl, :pressed => 'vm_miq_request_new')
          end

          it 'returns proper template type while provisioning instances' do
            controller.send(:prov_redirect)
            expect(subject).to eq('cloud')
          end
        end
      end
    end
  end

  describe "#determine_record_id_for_presenter" do
    context "when in a form" do
      before do
        controller.instance_variable_set(:@in_a_form, true)
      end

      it "return nil when @edit is nil" do
        controller.instance_variable_set(:@edit, nil)
        expect(controller.send(:determine_record_id_for_presenter)).to be_nil
      end

      it "returns @edit[:rec_id] when @edit is not nil" do
        [nil, 42].each do |id|
          edit = {:rec_id => id}
          controller.instance_variable_set(:@edit, edit)
          expect(controller.send(:determine_record_id_for_presenter)).to eq(id)
        end
      end
    end

    context "when not in a form" do
      before do
        controller.instance_variable_set(:@in_a_form, false)
      end

      it "returns nil when @record is nil" do
        controller.instance_variable_set(:@record, nil)
        expect(controller.send(:determine_record_id_for_presenter)).to be_nil
      end

      it "returns @record.id when @record is not nil" do
        [nil, 42].each do |id|
          record = double("Record")
          allow(record).to receive(:id).and_return(id)
          controller.instance_variable_set(:@record, record)
          expect(controller.send(:determine_record_id_for_presenter)).to eq(id)
        end
      end
    end

    describe "#get_view" do
      it 'calculates grid hash condition' do
        controller.instance_variable_set(:@force_no_grid_xml, false)
        controller.instance_variable_set(:@force_grid_xml, true)
        controller.instance_variable_set(:@gtl_type, "list")

        view = OpenStruct.new
        view.db = "MiqProvision"
        expect(controller.send(:grid_hash_conditions, view)).to eq(false)
        view.db = "Build"
        expect(controller.send(:grid_hash_conditions, view)).to eq(false)
        view.db = "ContainerBuild"
        expect(controller.send(:grid_hash_conditions, view)).to eq(true)
        controller.instance_variable_set(:@force_no_grid_xml, true)
        expect(controller.send(:grid_hash_conditions, view)).to eq(false)
      end
    end
  end

  describe "#get_view" do
    before do
      search = FactoryBot.create(:miq_search, :name => 'sds')
      user = FactoryBot.create(:user_with_group, :settings => {:default_search => {:Host => search.id}})
      login_as user
      session[:settings] = {:default_search => {:Host => search.id},
                            :views          => {:persistentvolume => 'list'},
                            :perpage        => {:list => 10}}
      controller.instance_variable_set(:@settings, :default_search => {:Host => search.id})
    end

    it "does not load default selected search on tagging screen" do
      controller.instance_variable_set(:@edit, :tagging => "Host")
      expect(controller).to_not receive(:load_default_search)
      controller.send(:get_view, "Host", :gtl_dbname => :host)
    end
  end

  describe "#build_user_emails_for_edit" do
    before do
      EvmSpecHelper.local_miq_server
      MiqUserRole.seed

      role = MiqUserRole.find_by(:name => "EvmRole-operator")

      group1 = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Group1")
      @user1 = FactoryBot.create(:user, :userid => "User1", :miq_groups => [group1], :email => "user1@test.com")

      group2 = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Group2")
      @user2 = FactoryBot.create(:user, :userid => "User2", :miq_groups => [group2], :email => "user2@test.com")

      current_group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Current Group")
      @current_user = FactoryBot.create(:user, :userid => "Current User", :miq_groups => [current_group, group1],
                                                :email => "current_user@test.com")

      login_as @current_user

      @edit = {:new => {:email => {:to => []}}, :user_emails => []}
    end

    it "finds users with groups which belongs to current user's groups" do
      user_ids = User.with_groups(@current_user.miq_groups.pluck(:id)).collect(&:userid)
      expect(user_ids).to include(@current_user.userid)
      expect(user_ids).to include(@user1.userid)
    end

    it "listing users's emails which belongs to current user's groups" do
      controller.instance_variable_set(:@edit, @edit)

      expect do
        controller.send(:build_user_emails_for_edit)
        @edit = controller.instance_variable_get(:@edit)
      end.to change { @edit[:user_emails].count }.from(0).to(2)

      @edit = controller.instance_variable_get(:@edit)

      expect(@edit[:user_emails]).not_to be_blank
      expect(@edit[:user_emails]).to include(@current_user.email => "#{@current_user.name} (#{@current_user.email})")
      expect(@edit[:user_emails]).to include(@user1.email => "#{@user1.name} (#{@user1.email})")
      expect(@edit[:user_emails]).not_to include(@user2.email => "#{@user2.name} (#{@user2.email})")
    end

    it "listing users's emails which belongs to current user's groups and some of them was already selected" do
      @edit[:new][:email][:to] = [@current_user.email] # selected users

      controller.instance_variable_set(:@edit, @edit)

      expect do
        controller.send(:build_user_emails_for_edit)
        @edit = controller.instance_variable_get(:@edit)
      end.to change { @edit[:user_emails].count }.from(0).to(1)

      expect(@edit[:user_emails]).not_to be_blank
      current_user_hash = {@current_user.email => "#{@current_user.name} (#{@current_user.email})"}
      expect(@edit[:user_emails]).not_to include(current_user_hash)
      expect(@edit[:user_emails]).to include(@user1.email => "#{@user1.name} (#{@user1.email})")
    end
  end

  describe '#perpage_key' do
    {
      'miqreportresult' => :reports,
      'job'             => :job_task,
      'miqtask'         => :job_task
    }.each do |dbname, response|
      context "key is #{dbname}" do
        it "returns with #{response}" do
          expect(controller.send(:perpage_key, dbname)).to eq(response)
        end
      end
    end

    {
      'grid'   => :grid,
      'list'   => :list,
      'tile'   => :tile,
      'foobar' => nil
    }.each do |gtl_type, response|
      context "gtl_type is #{gtl_type}" do
        before { controller.instance_variable_set(:@gtl_type, gtl_type) }

        it "returns with #{response}" do
          expect(controller.send(:perpage_key, 'foobar')).to eq(response)
        end
      end
    end
  end

  describe "#replace_trees_by_presenter" do
    let(:tree_1) { double(:name => 'tree_1', :type => 'tree_1') }
    let(:tree_2) { double(:name => 'tree_2', :type => 'tree_2') }
    let(:trees) { [tree_1, tree_2, nil] }
    let(:presenter) { double(:presenter) }

    it "calls render and passes data to presenter for each pair w/ value" do
      allow(tree_1).to receive(:locals_for_render).and_return(:bs_tree => {})
      allow(tree_2).to receive(:locals_for_render).and_return(:bs_tree => {})
      expect(presenter).to receive(:reload_tree).with(any_args).twice
      controller.send(:reload_trees_by_presenter, presenter, trees)
    end
  end

  describe "#flash_errors?" do
    it "returns true when errors are present in flash_array" do
      controller.instance_variable_set(:@flash_array, [:message => "Error message", :level => :error])
      expect(controller.send(:flash_errors?)).to be_truthy
    end

    it "returns false when there no errors are present in flash_array" do
      controller.instance_variable_set(:@flash_array, [:message => "Foo message"])
      expect(controller.send(:flash_errors?)).to be_falsey
    end
  end

  describe "#flash_warnings?" do
    it "returns true when errors are present in flash_array" do
      controller.instance_variable_set(:@flash_array, [:message => "Warning message", :level => :warning])
      expect(controller.send(:flash_warnings?)).to be_truthy
    end

    it "returns false when no warnings are present in flash_array" do
      controller.instance_variable_set(:@flash_array, [:message => "Foo message"])
      expect(controller.send(:flash_warnings?)).to be_falsey
    end
  end

  describe '#search_clear' do
    before do
      controller.instance_variable_set(:@breadcrumbs, [{:url => 'last url'}])
      controller.instance_variable_set(:@sb, :search_text => 'Search text')
    end

    it 'sets @search_text and @sb[:search_text] to nil' do
      allow(controller).to receive(:javascript_redirect)
      controller.send(:search_clear)
      expect(controller.instance_variable_get(:@search_text)).to be_nil
      expect(controller.instance_variable_get(:@sb)[:search_text]).to be_nil
    end

    it 'calls javascript_redirect for non-explorer' do
      expect(controller).to receive(:javascript_redirect).with('last url')
      controller.send(:search_clear)
    end

    context 'explorer screen' do
      before { controller.params = {:in_explorer => 'true'} }

      it 'calls reload' do
        expect(controller).to receive(:reload)
        controller.send(:search_clear)
      end
    end
  end

  context "private methods" do
    describe "#process_params_model_view" do
      it "with options[:model_name]" do
        expect(subject.send(:process_params_model_view, {:active_tree => :vms_instances_filter_tree, :model_name => "instances"}, {:model_name => "Vm"})).to eq(Vm)
      end

      it "with params[:active_tree]" do
        expect(subject.send(:process_params_model_view, {:active_tree => :vms_instances_filter_tree}, {})).to eq("Vm")
      end

      it "with params[:model_name]" do
        expect(subject.send(:process_params_model_view, {:model_name => "instances"}, {})).to eq(Vm)
      end

      it "with empty params and options will use the model method" do
        expect(ApplicationController).to receive(:model).and_return(Vm)
        expect(subject.send(:process_params_model_view, {}, {})).to eq(Vm)
      end
    end
  end
end
