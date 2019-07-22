describe ApplicationHelper do
  before do
    login_as FactoryBot.create(:user, :features => "none")
  end

  context "build_toolbar" do
    it 'should substitute dynamic function values' do
      req        = ActionDispatch::Request.new Rack::MockRequest.env_for '/?controller=foo'
      menu_info  = helper.build_toolbar 'storages_center_tb'
      title_text = "Datastores"

      menu_info[0][:items].collect do |value|
        ['title', :confirm].each do |field|
          if value[field]
            expect(value[field]).to match(title_text)
          end
        end
      end
    end

    it 'should substitute dynamic ivar values' do
      req = ActionDispatch::Request.new Rack::MockRequest.env_for '/?controller=foo'
      controller.instance_variable_set(:@sb,
                                       :active_tree => :cb_reports_tree,
                                       :nodeid      => 'Storage',
                                       :mode        => 'foo')

      menu_info  = helper.build_toolbar 'miq_policies_center_tb'
      title_text = "Datastore"

      menu_info[0][:items].collect do |value|
        next unless value['title']
        expect(value['title']).to match(title_text)
        expect(value['title']).to match("Foo") # from :mode
      end
    end
  end

  describe "#role_allows?" do
    let(:features) { MiqProductFeature.find_all_by_identifier("everything") }
    before do
      EvmSpecHelper.seed_specific_product_features("miq_report", "service")
      @user = login_as FactoryBot.create(:user, :features => features)
    end

    context "permission store" do
      it 'consults the permission store' do
        begin
          current_store = Vmdb::PermissionStores.instance
          Tempfile.open('foo') do |tf|
            menu = Menu::DefaultMenu.services_menu_section

            tf.write Psych.dump [menu.id]
            tf.close

            Vmdb::PermissionStores.configure do |config|
              config.backend = 'yaml'
              config.options[:filename] = tf.path
            end
            Vmdb::PermissionStores.initialize!

            expect(Menu::DefaultMenu.services_menu_section.visible?).to be_truthy
            expect(Menu::DefaultMenu.overview_menu_section.visible?).to be_falsey

            # TODO: Fix this assert, it's bad.  We need to create the right feature
            # for this user so it's allowed using normal permissions but not with
            # the permission store.
            allow(User).to receive_message_chain(:current_user, :role_allows?).and_return(true)
            expect(Menu::DefaultMenu.overview_menu_section.visible?).to be_falsey
          end
        ensure
          Vmdb::PermissionStores.instance = current_store
        end
      end
    end

    context "when with :feature" do
      context "and :any" do
        it "and entitled" do
          expect(helper.role_allows?(:feature => "miq_report", :any => true)).to be_truthy
        end

        it "and not entitled" do
          login_as FactoryBot.create(:user, :features => "service")
          expect(helper.role_allows?(:feature => "miq_report", :any => true)).to be_falsey
        end
      end

      context "and no :any" do
        it "and entitled" do
          expect(helper.role_allows?(:feature => "miq_report")).to be_truthy
        end

        it "and not entitled" do
          login_as FactoryBot.create(:user, :features => "service")
          expect(helper.role_allows?(:feature => "miq_report")).to be_falsey
        end
      end
    end

    context "when with :main_tab_id" do
      it "and entitled" do
        expect(Menu::DefaultMenu.services_menu_section.visible?).to be_truthy
      end

      it "and not entitled" do
        allow(@user).to receive(:role_allows_any?).and_return(false)
        expect(Menu::DefaultMenu.services_menu_section.visible?).to be_falsey
      end
    end

    it "when not with :feature or :main_tab_id" do
      expect(helper.role_allows?).to be_falsey
    end
  end

  describe "#rbac_common_feature_for_buttons" do
    %w(rbac_project_add rbac_tenant_add).each do |pressed|
      it "returns the correct common button" do
        expect(rbac_common_feature_for_buttons(pressed)).to eql("rbac_tenant_add")
      end
    end

    it "returns the passed in argument if no common buttons are found" do
      expect(rbac_common_feature_for_buttons("rbac_tenant_edit")).to eql("rbac_tenant_edit")
    end
  end

  describe "#model_to_controller" do
    subject { helper.model_to_controller(@record) }

    it "when with any record" do
      @record = FactoryBot.create(:vm_vmware)
      expect(subject).to eq(@record.class.base_model.name.underscore)
    end

    it "when record is nil" do
      expect { helper.model_to_controller(nil) }.to raise_error(NoMethodError)
    end
  end

  describe "#object_types_for_flash_message" do
    before do
      @record_1 = FactoryBot.create(:vm_openstack, :type => ManageIQ::Providers::Openstack::CloudManager::Vm.name,       :template => false)
      @record_2 = FactoryBot.create(:vm_openstack, :type => ManageIQ::Providers::Openstack::CloudManager::Vm.name,       :template => false)
      @record_3 = FactoryBot.create(:vm_openstack, :type => ManageIQ::Providers::Openstack::CloudManager::Template.name, :template => true)
      @record_4 = FactoryBot.create(:vm_openstack, :type => ManageIQ::Providers::Openstack::CloudManager::Template.name, :template => true)
      @record_5 = FactoryBot.create(:vm_redhat,    :type => ManageIQ::Providers::Redhat::InfraManager::Vm.name)
      @record_6 = FactoryBot.create(:vm_vmware,    :type => ManageIQ::Providers::Vmware::InfraManager::Vm.name)
    end

    context "when formatting flash message for VM or Templates class" do
      before do
        @klass = VmOrTemplate
      end

      it "with one Instance" do
        record_ids = [@record_1.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Instance")
      end

      it "with multiple Instances" do
        record_ids = [@record_1.id, @record_2.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Instances")
      end

      it "with one Instance and one Image" do
        record_ids = [@record_1.id, @record_3.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Image and Instance")
      end

      it "with one Instance and multiple Images" do
        record_ids = [@record_1.id, @record_3.id, @record_4.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Images and Instance")
      end

      it "with multiple Instances and multiple Images" do
        record_ids = [@record_1.id, @record_2.id, @record_3.id, @record_4.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Images and Instances")
      end

      it "with multiple Instances and one Virtual Machine" do
        record_ids = [@record_1.id, @record_2.id, @record_5.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Instances and Virtual Machine")
      end

      it "with multiple Instances and multiple Virtual Machines" do
        record_ids = [@record_1.id, @record_2.id, @record_5.id, @record_6.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Instances and Virtual Machines")
      end

      it "with multiple Instances, one Image and multiple Virtual Machines" do
        record_ids = [@record_5.id, @record_6.id, @record_1.id, @record_2.id, @record_4.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Image, Instances, and Virtual Machines")
      end

      it "with multiple Instances, multiple Images and multiple Virtual Machines" do
        record_ids = [@record_5.id, @record_6.id, @record_1.id, @record_2.id, @record_3.id, @record_4.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Images, Instances, and Virtual Machines")
      end
    end

    context "when formatting flash message for Non VM or Templates class" do
      before do
        @klass = Service
      end

      it "with one Service" do
        record_ids = [@record_1.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Service")
      end

      it "with multiple Services" do
        record_ids = [@record_1.id, @record_2.id]
        expect(helper.object_types_for_flash_message(@klass, record_ids)).to eq("Services")
      end
    end
  end

  describe "#url_for_db" do
    before do
      @action = 'show'
      @id = 12
    end

    context "when with @vm" do
      before do
        @vm = FactoryBot.create(:vm_vmware)
      end

      ["Account", "User", "Group", "Patch", "GuestApplication"].each do |d|
        it "and db = #{d}" do
          db = d
          @last_action = (d == "Account" ? "users" : d.tableize)
          expect(helper.url_for_db(db, @action)).to eq(helper.url_for(:controller => "vm_or_template",
                                                                      :action     => @lastaction,
                                                                      :id         => @vm,
                                                                      :show       => @id))
        end
      end

      it "otherwise" do
        db = "vm"
        c, a = helper.db_to_controller(db, @action)
        expect(helper.url_for_db(db, @action)).to eq(helper.url_for(:controller => c, :action => a, :id => @id))
      end
    end

    context "when with @host" do
      before do
        @host = FactoryBot.create(:host)
        @lastaction = "list"
      end

      ["Patch", "GuestApplication"].each do |d|
        it "and db = #{d}" do
          db = d
          expect(helper.url_for_db(db, @action))
            .to eq(helper.url_for(:controller => "host", :action => @lastaction, :id => @host, :show => @id))
        end
      end

      it "otherwise" do
        db = "vm"
        c, a = helper.db_to_controller(db, @action)
        expect(helper.url_for_db(db, @action)).to eq(helper.url_for(:controller => c, :action => a, :id => @id))
      end
    end

    it "when with no @vm, no @host, and no @db" do
      db = 'Vm'
      expect(helper.url_for_db(db, @action)).to eq("/vm/#{@action}/#{@id}")
    end
  end

  describe "#db_to_controller" do
    subject { helper.db_to_controller(@db) }

    context "when with ActionSet" do
      before { @db = "ActionSet" }

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("miq_action")
        expect(subject[1]).to eq("show_set")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("miq_action")
        expect(subject[1]).to eq("show_set")
      end
    end

    context "when with AutomationRequest" do
      before { @db = "AutomationRequest" }

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("miq_request")
        expect(subject[1]).to eq("show")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("miq_request")
        expect(subject[1]).to eq("show")
      end
    end

    context "when with ConditionSet" do
      before do
        @db = "ConditionSet"
      end

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("condition")
        expect(subject[1]).to eq("x_show")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("condition")
        expect(subject[1]).to eq("show")
      end
    end

    context "when with EmsInfra" do
      before { @db = "EmsInfra" }

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("ems_infra")
        expect(subject[1]).to eq("x_show")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("ems_infra")
        expect(subject[1]).to eq("show")
      end
    end

    context "when with EmsCloud" do
      before { @db = "EmsCloud" }

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("ems_cloud")
        expect(subject[1]).to eq("x_show")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("ems_cloud")
        expect(subject[1]).to eq("show")
      end
    end

    context "when with ScanItemSet" do
      before { @db = "ScanItemSet" }

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("ops")
        expect(subject[1]).to eq("ap_show")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("ops")
        expect(subject[1]).to eq("ap_show")
      end
    end

    context "when with MiqEventDefinition" do
      before { @db = "MiqEventDefinition" }

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("event")
        expect(subject[1]).to eq("_none_")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("event")
        expect(subject[1]).to eq("_none_")
      end
    end

    ["User", "Group", "Patch", "GuestApplication"].each do |db|
      context "when with #{db}" do
        before { @db = db; @lastaction = "some_action" }

        it "and @explorer" do
          @explorer = true
          expect(subject[0]).to eq("vm")
          expect(subject[1]).to eq(@lastaction)
        end

        it "and not @explorer" do
          @explorer = nil
          expect(subject[0]).to eq("vm")
          expect(subject[1]).to eq(@lastaction)
        end
      end
    end

    context "when with MiqReportResult" do
      before { @db = "MiqReportResult" }

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("report")
        expect(subject[1]).to eq("show_saved")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("report")
        expect(subject[1]).to eq("show_saved")
      end
    end

    context "when with MiqAeClass" do
      before { @db = "MiqAeClass" }

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("miq_ae_class")
        expect(subject[1]).to eq("show_instances")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("miq_ae_class")
        expect(subject[1]).to eq("show_instances")
      end
    end

    context "when with MiqAeInstance" do
      before { @db = "MiqAeInstance" }

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("miq_ae_class")
        expect(subject[1]).to eq("show_details")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("miq_ae_class")
        expect(subject[1]).to eq("show_details")
      end
    end

    ["ServiceResource", "ServiceTemplate"].each do |db|
      context "when with #{db}" do
        before { @db = db }

        it "and @explorer" do
          @explorer = true
          expect(subject[0]).to eq("catalog")
          expect(subject[1]).to eq("x_show")
        end

        it "and not @explorer" do
          @explorer = nil
          expect(subject[0]).to eq("catalog")
          expect(subject[1]).to eq("show")
        end
      end
    end

    context "when with ManageIQ::Providers::ContainerManager" do
      before { @db = "ManageIQ::Providers::ContainerManager" }

      it "and @explorer" do
        @explorer = true
        expect(subject[0]).to eq("ems_container")
        expect(subject[1]).to eq("x_show")
      end

      it "and not @explorer" do
        @explorer = nil
        expect(subject[0]).to eq("ems_container")
        expect(subject[1]).to eq("show")
      end
    end
  end

  describe "#field_to_col" do
    subject { helper.field_to_col(field) }
    context "when field likes 'Vm.hardware.disks-size'" do
      let(:field) { "Vm.hardware.disks-size" }
      it { is_expected.to eq("disks.size") }
    end

    context "when field likes 'disks-size'" do
      let(:field) { "disks-size" }
      it { is_expected.to eq("size") }
    end

    context "when field likes 'size'" do
      let(:field) { "size" }
      it { is_expected.to be_falsey }
    end

    context "when field likes 'Vm.size'" do
      let(:field) { "Vm.size" }
      it { is_expected.not_to eq("size") }
    end
  end

  context "#is_browser?" do
    it "when browser's name is in the list" do
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, :name).and_return('safari')
      expect(helper.is_browser?(%w(firefox opera safari))).to be_truthy
    end

    it "when browser's name is NOT in the list" do
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, :name).and_return('explorer')
      expect(helper.is_browser?(%w(firefox opera safari))).to be_falsey
    end
  end

  context "#is_browser_os?" do
    it "when browser's OS is in the list" do
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, :os).and_return('windows')
      expect(helper.is_browser_os?(%w(windows linux))).to be_truthy
    end

    it "when browser's OS is NOT in the list" do
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, :os).and_return('macos')
      expect(helper.is_browser_os?(%w(windows linux))).to be_falsey
    end
  end

  context "#browser_info" do
    it "preserves the case" do
      type = :a_type
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, type).and_return('checked_by_A_TYPE')
      expect(helper.browser_info(type)).to eq('checked_by_A_TYPE')
    end
  end

  describe "#javascript_for_timer_type" do
    subject { helper.javascript_for_timer_type(timer_type) }

    context "when timer_type == nil" do
      let(:timer_type) { nil }
      specify { expect(subject).to be_empty }
    end

    context "when timer_type == 'Monthly'" do
      let(:timer_type) { 'Monthly' }
      it { is_expected.to include("$('\#weekly_span').hide();") }
      it { is_expected.to include("$('\#daily_span').hide();") }
      it { is_expected.to include("$('\#hourly_span').hide();") }
      it { is_expected.to include("$('\#monthly_span').show();") }
    end

    context "when timer_type == 'Weekly'" do
      let(:timer_type) { 'Weekly' }
      it { is_expected.to include("$('\#daily_span').hide();") }
      it { is_expected.to include("$('\#hourly_span').hide();") }
      it { is_expected.to include("$('\#monthly_span').hide();") }
      it { is_expected.to include("$('\#weekly_span').show();") }
    end

    context "when timer_type == 'Daily'" do
      let(:timer_type) { 'Daily' }
      it { is_expected.to include("$('\#hourly_span').hide();") }
      it { is_expected.to include("$('\#monthly_span').hide();") }
      it { is_expected.to include("$('\#weekly_span').hide();") }
      it { is_expected.to include("$('\#daily_span').show();") }
    end

    context "when timer_type == 'Hourly'" do
      let(:timer_type) { 'Hourly' }
      it { is_expected.to include("$('\#daily_span').hide();") }
      it { is_expected.to include("$('\#monthly_span').hide();") }
      it { is_expected.to include("$('\#weekly_span').hide();") }
      it { is_expected.to include("$('\#hourly_span').show();") }
    end

    context "when timer_type == 'something_else'" do
      let(:timer_type) { 'something_else' }
      it { is_expected.to include("$('\#daily_span').hide();") }
      it { is_expected.to include("$('\#hourly_span').hide();") }
      it { is_expected.to include("$('\#monthly_span').hide();") }
      it { is_expected.to include("$('\#weekly_span').hide();") }
    end
  end

  describe "#javascript_for_miq_button_visibility" do
    subject { helper.javascript_for_miq_button_visibility(display) }
    context "when display == true" do
      let(:display) { true }
      it { is_expected.to eq("miqButtons('show');") }
    end

    context "when dsiplay == false" do
      let(:display) { false }
      it { is_expected.to eq("miqButtons('hide');") }
    end
  end

  context "#javascript_reload_toolbars" do
    subject { helper.javascript_reload_toolbars }

    it "returns javascript to reload toolbar" do
      expect(helper).to receive(:toolbar_from_hash).and_return('foobar')
      is_expected.to include("sendDataWithRx({redrawToolbar: \"foobar\"});")
    end
  end

  context "#set_edit_timer_from_schedule" do
    before do
      @edit = {:tz => 'Eastern Time (US & Canada)', :new => {}}
      @interval = '3'
      @date = "6/28/2012"
      @hour = "0#{11 - 4}"
      @min = "14"
      @run_at = {:start_time => "2012-06-28 11:14:00".to_time(:utc),
                 :interval   => {:value => @interval}}
      @schedule = double(:run_at => @run_at)
    end

    describe "when schedule.run_at == nil" do
      it "sets defaults" do
        schedule = double(:run_at => nil)
        helper.set_edit_timer_from_schedule schedule
        expect(@edit[:new][:timer].to_h).to include(
          :typ        => 'Once',
          :start_hour => "00",
          :start_min  => '00'
        )
      end
    end

    describe "when schedule.run_at != nil" do
      it "sets values as monthly" do
        @run_at[:interval][:unit] = 'monthly'
        helper.set_edit_timer_from_schedule @schedule
        expect(@edit[:new][:timer].to_h).to include(
          :start_date => @date,
          :start_hour => @hour,
          :start_min  => @min,
          :months     => @interval,
          :typ        => 'Monthly'
        )
        expect(@edit[:new][:timer].to_h).not_to include(:months => '1')
      end

      it "sets values as weekly" do
        @run_at[:interval][:unit] = 'weekly'
        helper.set_edit_timer_from_schedule @schedule
        expect(@edit[:new][:timer].to_h).to include(
          :start_date => @date,
          :start_hour => @hour,
          :start_min  => @min,
          :weeks      => @interval,
          :typ        => 'Weekly'
        )
        expect(@edit[:new][:timer].to_h).not_to include(:weeks => '1')
      end

      it "sets values as daily" do
        @run_at[:interval][:unit] = 'daily'
        helper.set_edit_timer_from_schedule @schedule
        expect(@edit[:new][:timer].to_h).to include(
          :start_date => @date,
          :start_hour => @hour,
          :start_min  => @min,
          :days       => @interval,
          :typ        => 'Daily'
        )
        expect(@edit[:new][:timer].to_h).not_to include(:days => '1')
      end

      it "sets values as hourly" do
        @run_at[:interval][:unit] = 'hourly'
        helper.set_edit_timer_from_schedule @schedule
        expect(@edit[:new][:timer].to_h).to include(
          :start_date => @date,
          :start_hour => @hour,
          :start_min  => @min,
          :hours      => @interval,
          :typ        => 'Hourly'
        )
        expect(@edit[:new][:timer].to_h).not_to include(:hours => '1')
      end
    end
  end

  context "#perf_parent?" do
    it "when model == 'VmOrTemplate' and typ == 'realtime'" do
      @perf_options = {:model => 'VmOrTemplate', :typ => 'realtime'}
      expect(helper.perf_parent?).to be_falsey
    end

    it "when model == 'VmOrTemplate', typ != 'realtime' and parent is 'Host'" do
      @perf_options = {:model => 'VmOrTemplate', :typ => 'Hourly', :parent => 'Host'}
      expect(helper.perf_parent?).to be_truthy
    end

    it "when model == 'VmOrTemplate', typ != 'realtime' and parent is 'EmsCluster'" do
      @perf_options = {:model => 'VmOrTemplate', :typ => 'Hourly', :parent => 'EmsCluster'}
      expect(helper.perf_parent?).to be_truthy
    end

    it "when model == 'VmOrTemplate', typ != 'realtime' and parent is 'invalid parent'" do
      @perf_options = {:model => 'VmOrTemplate', :typ => 'Hourly', :parent => 'invalid parent'}
      expect(helper.perf_parent?).to be_falsey
    end

    it "when model == 'VmOrTemplate', typ != 'realtime' and parent == nil" do
      @perf_options = {:model => 'VmOrTemplate', :typ => 'Hourly', :parent => nil}
      expect(helper.perf_parent?).to be_falsey
    end
  end

  context "#model_report_type" do
    it "when model == nil" do
      expect(helper.model_report_type(nil)).to be_falsey
    end

    it "when model likes '...Performance' or '...MetricsRollup'" do
      expect(helper.model_report_type("VmPerformance")).to eq(:performance)
    end

    it "when model == VimPerformanceTrend" do
      expect(helper.model_report_type("VimPerformanceTrend")).to eq(:trend)
    end

    it "when model == Chargeback" do
      expect(helper.model_report_type("Chargeback")).to eq(:chargeback)
    end
  end

  context "tree related methods" do
    before do
      @sb = {:active_tree => :svcs_tree,
             :trees       => {:svcs_tree => {:tree => :svcs_tree}}}
    end

    it "#x_node_set" do
      @sb[:trees][:svcs_tree]      = {:active_node => 'root'}
      @sb[:trees][:vm_filter_tree] = {:active_node => 'abc'}

      helper.x_node_set('def', :vm_filter_tree)
      expect(@sb[:trees][:svcs_tree][:active_node]).to eq('root')
      expect(@sb[:trees][:vm_filter_tree][:active_node]).to eq('def')

      helper.x_node_set(nil, :vm_filter_tree)
      expect(@sb[:trees][:svcs_tree][:active_node]).to eq('root')
      expect(@sb[:trees][:vm_filter_tree][:active_node]).to be_nil

      helper.x_node_set('', :vm_filter_tree)
      expect(@sb[:trees][:svcs_tree][:active_node]).to eq('root')
      expect(@sb[:trees][:vm_filter_tree][:active_node]).to eq('')
    end

    it "#x_node=" do
      helper.x_node = 'root'
      expect(@sb[:trees][:svcs_tree][:active_node]).to eq('root')

      helper.x_node = nil
      expect(@sb[:trees][:svcs_tree][:active_node]).to be_nil

      helper.x_node = ''
      expect(@sb[:trees][:svcs_tree][:active_node]).to eq('')
    end

    context "#x_node" do
      it "without tree param" do
        @sb[:trees][:svcs_tree] = {:active_node => 'root'}
        expect(helper.x_node).to eq('root')

        @sb[:trees][:svcs_tree] = {:active_node => nil}
        expect(helper.x_node).to be_nil

        @sb[:trees][:svcs_tree] = {:active_node => ''}
        expect(helper.x_node).to eq('')
      end

      it "with tree param" do
        @sb[:trees][:svcs_tree]      = {:active_node => 'root'}
        @sb[:trees][:vm_filter_tree] = {:active_node => 'abc'}

        expect(helper.x_node(:svcs_tree)).to eq("root")
        expect(helper.x_node(:vm_filter_tree)).to eq("abc")
      end
    end

    context "#x_tree" do
      it "without tree param" do
        @sb[:trees][:vm_filter_tree] = {:tree => :vm_filter_tree}

        expect(helper.x_tree).to eq(@sb[:trees][:svcs_tree])
        @sb[:active_tree] = :vm_filter_tree
        expect(helper.x_tree).to eq(@sb[:trees][:vm_filter_tree])
      end

      it "with tree param" do
        @sb[:trees][:vm_filter_tree] = {:tree => :vm_filter_tree}
        @sb[:trees][:svcs_tree]      = {:tree => :svcs_tree}

        expect(helper.x_tree(:svcs_tree)).to eq(@sb[:trees][:svcs_tree])
        expect(helper.x_tree(:vm_filter_tree)).to eq(@sb[:trees][:vm_filter_tree])
      end
    end

    it "#x_active_tree=" do
      helper.x_active_tree = 'vms_filter_tree'
      expect(@sb[:active_tree]).to eq(:vms_filter_tree)

      helper.x_active_tree = 'svcs_tree'
      expect(@sb[:active_tree]).to eq(:svcs_tree)
    end

    it "#x_active_tree" do
      expect(helper.x_active_tree).to eq(:svcs_tree)
      @sb[:active_tree] = :vm_filter_tree
      expect(helper.x_active_tree).to eq(:vm_filter_tree)
    end

    context "#x_tree_init" do
      it "does not replace existing trees" do
        helper.x_tree_init(:svcs_tree, :xxx, "XXX")

        expect(@sb[:trees][:svcs_tree]).to eq(:tree => :svcs_tree)
      end

      it "has default values" do
        helper.x_tree_init(:vm_filter_tree, :vm_filter, "Vm")

        expect(@sb[:trees][:vm_filter_tree]).to eq(:tree       => :vm_filter_tree,
                                                   :type       => :vm_filter,
                                                   :leaf       => "Vm",
                                                   :open_nodes => [])
      end
    end

    it "#x_tree_history" do
      @sb = {:history     => {:svcs_tree => %w(service1 service2 service3)},
             :active_tree => :svcs_tree}
      expect(helper.x_tree_history).to eq(%w(service1 service2 service3))
    end
  end

  describe '#pressed2model_action' do
    examples = {
      'miq_template_bar' => ['miq_template', 'bar'],
      'boo_far'          => ['boo', 'far'],
      'boo_far_bar'      => ['boo', 'far_bar'],
    }

    examples.each_pair do |input, output|
      it "gives '#{output}' on '#{input}'" do
        expect(helper.pressed2model_action(input)).to eq(output)
      end
    end
  end

  context "#title_for_cluster_record" do
    before do
      @ems1 = FactoryBot.create(:ems_vmware)
      @ems2 = FactoryBot.create(:ems_openstack_infra)
    end

    it "returns 'Cluster' for non-openstack host" do
      cluster = FactoryBot.create(:ems_cluster, :ems_id => @ems1.id)

      result = helper.title_for_cluster_record(cluster)
      expect(result).to eq("Cluster")
    end

    it "returns 'Deployment Role' for openstack host" do
      cluster = FactoryBot.create(:ems_cluster, :ems_id => @ems2.id)

      result = helper.title_for_cluster_record(cluster)
      expect(result).to eq("Deployment Role")
    end
  end

  context "#title_for_host_record" do
    it "returns 'Host' for non-openstack host" do
      host = FactoryBot.create(:host_vmware, :ext_management_system => FactoryBot.create(:ems_vmware))

      expect(helper.title_for_host_record(host)).to eq("Host")
    end

    it "returns 'Node' for openstack host" do
      host = FactoryBot.create(:host_openstack_infra, :ext_management_system => FactoryBot.create(:ems_openstack_infra))

      expect(helper.title_for_host_record(host)).to eq("Node")
    end
  end

  context "#tree_with_advanced_search?" do
    it 'should return true for explorer trees with advanced search' do
      controller.instance_variable_set(:@sb,
                                       :active_tree => :vms_instances_filter_tree,
                                       :trees       => {
                                         :vms_instances_filter_tree => {
                                           :tree => :vms_instances_filter_tree,
                                           :type => :vms_instances_filter
                                         }
                                       })
      result = helper.tree_with_advanced_search?
      expect(result).to be_truthy
    end

    it 'should return true for the configuration scripts tree' do
      controller.instance_variable_set(:@sb,
                                       :active_tree => :configuration_scripts_tree,
                                       :trees       => {
                                         :configuration_scripts_tree => {
                                           :tree => :configuration_scripts_tree,
                                           :type => :configuration_scripts
                                         }
                                       })
      result = helper.tree_with_advanced_search?
      expect(result).to be_truthy
    end

    it 'should return true for the configuration providers tree' do
      controller.instance_variable_set(:@sb,
                                       :active_tree => :configuration_manager_providers_tree,
                                       :trees       => {
                                         :configuration_manager_providers_tree => {
                                           :tree => :configuration_manager_providers_tree,
                                           :type => :configuration_manager_providers
                                         }
                                       })
      result = helper.tree_with_advanced_search?
      expect(result).to be_truthy
    end

    it 'should return false for tree w/o advanced search' do
      controller.instance_variable_set(:@sb,
                                       :active_tree => :reports_tree,
                                       :trees       => {
                                         :reports_tree => {
                                           :tree => :reports_tree,
                                           :type => :reports
                                         }
                                       })
      result = helper.tree_with_advanced_search?
      expect(result).to be_falsey
    end
  end

  describe "#show_adv_search?" do
    it 'should return false for explorer screen with no trees such as automate/simulation' do
      controller.instance_variable_set(:@explorer, true)
      controller.instance_variable_set(:@sb, {})
      result = helper.show_adv_search?
      expect(result).to be_falsey
    end

    it 'should return true for VM explorer trees' do
      controller.instance_variable_set(:@explorer, true)
      controller.instance_variable_set(:@sb,
                                       :active_tree => :vms_instances_filter_tree,
                                       :trees       => {
                                         :vms_instances_filter_tree => {
                                           :tree => :vms_instances_filter_tree,
                                           :type => :vms_instances_filter
                                         }
                                       })
      result = helper.show_adv_search?
      expect(result).to be_truthy
    end
  end

  describe "#show_advanced_search?" do
    it 'should return true for VM explorer trees' do
      controller.instance_variable_set(:@sb,
                                       :active_tree => :vms_instances_filter_tree,
                                       :trees       => {
                                         :vms_instances_filter_tree => {
                                           :tree => :vms_instances_filter_tree,
                                           :type => :vms_instances_filter
                                         }
                                       })
      result = helper.show_advanced_search?
      expect(result).to be_truthy
    end

    it 'should return false for non-VM explorer trees' do
      controller.instance_variable_set(:@sb,
                                       :active_tree => :reports_tree,
                                       :trees       => {
                                         :reports_tree => {
                                           :tree => :reports_tree,
                                           :type => :reports
                                         }
                                       })
      result = helper.show_advanced_search?
      expect(result).to be_falsey
    end

    it 'should return true for non-VM explorer trees when @show_adv_search is set' do
      controller.instance_variable_set(:@sb,
                                       :active_tree => :reports_tree,
                                       :trees       => {
                                         :reports_tree => {
                                           :tree => :reports_tree,
                                           :type => :reports
                                         }
                                       })
      controller.instance_variable_set(:@show_adv_search, true)
      result = helper.show_advanced_search?
      expect(result).to be_truthy
    end
  end

  describe "#display_adv_search?" do
    before do
      controller.instance_variable_set(:@layout, layout)
    end

    subject { helper.display_adv_search? }

    context 'Volume Snapshots page' do
      let(:layout) { "cloud_volume_snapshot" }

      it 'returns true' do
        expect(subject).to be(true)
      end
    end

    context 'Volume Backups page' do
      let(:layout) { "cloud_volume_backup" }

      it 'returns true' do
        expect(subject).to be(true)
      end
    end
  end

  it 'output of remote_function should not be html_safe' do
    expect(helper.remote_function(:url => {:controller => 'vm_infra', :action => 'explorer'}).html_safe?).to be_falsey
  end

  describe '#miq_accordion_panel' do
    subject do
      helper.miq_accordion_panel('title', active, 'identifier') do
        "content"
      end
    end

    context 'active tab' do
      let(:active) { true }
      it 'renders an active accordion' do
        expect(subject).to eq("<div class=\"panel panel-default\"><div class=\"panel-heading\"><h4 class=\"panel-title\"><a data-parent=\"#accordion\" data-toggle=\"collapse\" class=\"\" href=\"#identifier\">title</a></h4></div><div id=\"identifier\" class=\"panel-collapse collapse in\"><div class=\"panel-body\">content</div></div></div>")
      end
    end

    context 'inactive tab' do
      let(:active) { false }
      it 'renders an active accordion' do
        expect(subject).to eq("<div class=\"panel panel-default\"><div class=\"panel-heading\"><h4 class=\"panel-title\"><a data-parent=\"#accordion\" data-toggle=\"collapse\" class=\"collapsed\" href=\"#identifier\">title</a></h4></div><div id=\"identifier\" class=\"panel-collapse collapse \"><div class=\"panel-body\">content</div></div></div>")
      end
    end
  end

  describe '#li_link' do
    context 'with :if condition true' do
      let(:args) do
        {:if         => true,
         :controller => "ems_infra",
         :record_id  => 1}
      end

      subject { li_link(args) }

      it "returns HTML with enabled links" do
        expect(subject).to_not have_selector('li.disabled')
      end
    end

    context 'with :if condition false' do
      let(:args) do
        {:if        => false,
         :record_id => 1}
      end

      subject { li_link(args) }

      it 'renders disabled link_to' do
        expect(subject).to have_selector('li.disabled')
      end
    end

    context 'with :record passed in as an argument' do
      let(:args) do
        {:if         => true,
         :controller => 'availability_zone',
         :record     => FactoryBot.create(:availability_zone),
         :action     => 'show_list',
         :display    => 'something',
         :title      => 'sometitle'}
      end

      subject { li_link(args) }

      it 'renders url correctly' do
        expect(subject).to have_xpath("//a", :text => %r{\/availability_zone\/show_list\/\d+\?display=something})
      end

      it 'renders title correctly' do
        expect(subject).to have_xpath("//a[@title = 'sometitle']")
      end
    end

    context 'with :record_id passed in as an argument' do
      let(:args) do
        {:if         => true,
         :controller => 'availability_zone',
         :record_id  => FactoryBot.create(:availability_zone).id,
         :action     => 'show_list',
         :display    => 'something',
         :title      => 'sometitle'}
      end

      subject { li_link(args) }

      it 'renders url correctly' do
        expect(subject).to have_xpath("//a", :text => %r{\/availability_zone\/show_list\/\d+\?display=something})
      end

      it 'renders title correctly' do
        expect(subject).to have_xpath("//a[@title = 'sometitle']")
      end
    end
  end

  describe '#view_to_association' do
    [%w(AdvancedSetting advanced_settings), %w(OrchestrationStackOutput outputs),
     %w(OrchestrationStackParameter parameters), %w(OrchestrationStackResource resources), %w(Filesystem filesystems),
     %w(FirewallRule firewall_rules), %w(GuestApplication guest_applications), %w(Patch patches),
     %w(RegistryItem registry_items), %w(ScanHistory scan_histories)].each do |spec|
      it "finds the table name for #{spec[0]}" do
        view = double
        allow(view).to receive_messages(:db => spec[0], :scoped_association => nil)
        expect(helper.view_to_association(view, nil)).to eq(spec[1])
      end
    end

    it "finds table name for SystemService host" do
      allow(view).to receive_messages(:db => 'SystemService', :scoped_association => nil)
      expect(
        helper.view_to_association(
          view,
          ManageIQ::Providers::Vmware::InfraManager::Host.new
        )
      ).to eq('host_services')
    end
  end

  describe "#multiple_relationship_link" do
    context "When record is a Container Provider" do
      it "Uses polymorphic_path for the show action" do
        stub_user(:features => :all)
        ems = FactoryBot.create(:ems_kubernetes)
        ContainerProject.create(:ext_management_system => ems, :name => "Test Project")
        expect(helper.multiple_relationship_link(ems, "container_project")).to eq("<li><a title=\"Show Projects\" href=\"/ems_container/#{ems.id}?display=container_projects\">Projects (1)</a></li>")
      end
    end
  end

  describe "#model_to_report_data" do
    let(:instance) { test_class.new }
    let(:test_class) do
      Class.new do
        include ApplicationHelper
        attr_accessor :display, :params, :report_data_additional_options

        def controller
          HostController.new
        end
      end
    end

    it "the prefered case" do
      instance.report_data_additional_options = {:model => "Something"}

      expect(instance.model_to_report_data).to eq("Something")
    end

    it "the @display fallback" do
      instance.display = "vm_or_template"

      expect(instance.model_to_report_data).to eq("VmOrTemplate")
    end

    it "the params[:db] fallback" do
      instance.params = {:db => "vm_or_template", :display => "something" }

      expect(instance.model_to_report_data).to eq("VmOrTemplate")
    end

    it "the params[:display] fallback" do
      instance.params = {:display => "vm_or_template"}

      expect(instance.model_to_report_data).to eq("VmOrTemplate")
    end

    it "the controller.class.model fallback case" do
      instance.params = {}

      expect(instance.model_to_report_data).to eq("Host")
    end
  end

  context "calculate_toolbars for ems_container" do
    before do
      allow(helper).to receive(:inner_layout_present?).and_return(false)
      allow(controller).to receive(:restful?).and_return(true)
      allow(controller.class).to receive(:toolbar_plural).and_return(nil)
      allow(controller.class).to receive(:toolbar_singular).and_return(nil)
      allow(controller).to receive(:custom_toolbar)
      @layout = 'ems_container'
    end

    it "displays ems_containers_center toolbar for ems_container show_list action" do
      @lastaction = "show_list"
      expect(calculate_toolbars).to include("center_tb" => "ems_containers_center_tb")
    end

    it "displays ems_container_center toolbar for ems_container show_dashboard action" do
      @lastaction = "show_dashboard"
      expect(calculate_toolbars).to include("center_tb" => "ems_container_center_tb")
    end

    it "displays container routes center toolbar for 'container_routes' nested display lists" do
      @lastaction = "show"
      @display = "container_routes"
      expect(calculate_toolbars).to include("center_tb" => "container_routes_center")
    end

    it "displays container projects center toolbar for 'container_projects' nested display lists" do
      @lastaction = "show"
      @display = "container_projects"
      expect(calculate_toolbars).to include("center_tb" => "container_projects_center")
    end
  end

  describe '#provider_paused?' do
    subject { send(:provider_paused?, record) }

    context 'record is a provider' do
      let(:record) { FactoryBot.create(:ems_infra) }

      it "true if provider paused" do
        record.pause!
        expect(subject).to be_truthy
      end

      it "false if provider paused" do
        expect(subject).to be_falsey
      end
    end

    context 'record is a VM' do
      let(:record) { FactoryBot.create(:vm, :ext_management_system => FactoryBot.create(:ems_infra)) }

      it "true if provider paused" do
        record.ext_management_system.pause!
        expect(subject).to be_truthy
      end

      it "false if provider paused" do
        expect(subject).to be_falsey
      end
    end

    context 'record is a configured_system_foreman' do
      let(:record) { FactoryBot.create(:configured_system_foreman, :manager => FactoryBot.create(:configuration_manager_foreman)) }

      it "true if provider paused" do
        record.manager.pause!
        expect(subject).to be_truthy
      end

      it "false if provider paused" do
        expect(subject).to be_falsey
      end
    end
  end
end
