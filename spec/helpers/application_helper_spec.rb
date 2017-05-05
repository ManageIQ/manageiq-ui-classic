describe ApplicationHelper do
  before do
    login_as FactoryGirl.create(:user)
  end

  context "build_toolbar" do
    it 'should substitute dynamic function values' do
      req        = ActionDispatch::Request.new Rack::MockRequest.env_for '/?controller=foo'
      menu_info  = helper.build_toolbar 'storages_center_tb'
      title_text = ui_lookup(:tables => "storages")

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
      title_text = ui_lookup(:model => "Storage")

      menu_info[0][:items].collect do |value|
        next unless value['title']
        expect(value['title']).to match(title_text)
        expect(value['title']).to match("Foo") # from :mode
      end
    end
  end

  describe "#role_allows?" do
    let(:features) { MiqProductFeature.find_all_by_identifier("everything") }
    before(:each) do
      EvmSpecHelper.seed_specific_product_features("miq_report", "service")
      @user = login_as FactoryGirl.create(:user, :features => features)
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
            expect(Menu::DefaultMenu.cloud_inteligence_menu_section.visible?).to be_falsey

            # TODO: Fix this assert, it's bad.  We need to create the right feature
            # for this user so it's allowed using normal permissions but not with
            # the permission store.
            allow(User).to receive_message_chain(:current_user, :role_allows?).and_return(true)
            expect(Menu::DefaultMenu.cloud_inteligence_menu_section.visible?).to be_falsey
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
          login_as FactoryGirl.create(:user, :features => "service")
          expect(helper.role_allows?(:feature => "miq_report", :any => true)).to be_falsey
        end
      end

      context "and no :any" do
        it "and entitled" do
          expect(helper.role_allows?(:feature => "miq_report")).to be_truthy
        end

        it "and not entitled" do
          login_as FactoryGirl.create(:user, :features => "service")
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
      @record = FactoryGirl.create(:vm_vmware)
      expect(subject).to eq(@record.class.base_model.name.underscore)
    end

    it "when record is nil" do
      expect { helper.model_to_controller(nil) }.to raise_error(NoMethodError)
    end
  end

  describe "#object_types_for_flash_message" do
    before do
      @record_1 = FactoryGirl.create(:vm_openstack, :type => ManageIQ::Providers::Openstack::CloudManager::Vm.name,       :template => false)
      @record_2 = FactoryGirl.create(:vm_openstack, :type => ManageIQ::Providers::Openstack::CloudManager::Vm.name,       :template => false)
      @record_3 = FactoryGirl.create(:vm_openstack, :type => ManageIQ::Providers::Openstack::CloudManager::Template.name, :template => true)
      @record_4 = FactoryGirl.create(:vm_openstack, :type => ManageIQ::Providers::Openstack::CloudManager::Template.name, :template => true)
      @record_5 = FactoryGirl.create(:vm_redhat,    :type => ManageIQ::Providers::Redhat::InfraManager::Vm.name)
      @record_6 = FactoryGirl.create(:vm_vmware,    :type => ManageIQ::Providers::Vmware::InfraManager::Vm.name)
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

  describe "#url_for_record" do
    subject { helper.url_for_record(@record, @action = "show") }

    it "when record is VmOrTemplate" do
      @record = Vm.new
      expect(subject).to eq(helper.url_for_db(helper.controller_for_vm(helper.model_for_vm(@record)), @action))
    end

    it "when record is ManageIQ::Providers::AnsibleTower::AutomationManager" do
      @record = ManageIQ::Providers::AnsibleTower::AutomationManager.new
      expect(subject).to eq("/automation_manager/#{@action}")
    end

    it "when record is not VmOrTemplate" do
      @record = FactoryGirl.create(:host)
      expect(subject).to eq(helper.url_for_db(@record.class.base_class.to_s, @action))
    end
  end

  describe "#url_for_db" do
    before do
      @action = 'show'
      @id = 12
    end

    context "when with @vm" do
      before do
        @vm = FactoryGirl.create(:vm_vmware)
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
        @host = FactoryGirl.create(:host)
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

  context "#to_cid" do
    it "converts record id to compressed id" do
      expect(helper.to_cid(12_000_000_000_056)).to eq('12r56')
    end
  end

  context "#from_cid" do
    it "converts compressed id to record id" do
      expect(helper.from_cid("12r56")).to eq(12_000_000_000_056)
    end
  end

  context "#is_browser_ie7?" do
    it "when browser's explorer version 7.x" do
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, :name).and_return('explorer')
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, :version).and_return('7.10')
      expect(helper.is_browser_ie7?).to be_truthy
    end

    it "when browser's NOT explorer version 7.x" do
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, :name).and_return('explorer')
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, :version).and_return('6.10')
      expect(helper.is_browser_ie7?).to be_falsey
    end
  end

  context "#is_browser_ie?" do
    it "when browser's explorer" do
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, :name).and_return('explorer')
      expect(helper.is_browser_ie?).to be_truthy
    end

    it "when browser's NOT explorer" do
      allow_any_instance_of(ActionController::TestSession)
        .to receive(:fetch_path).with(:browser, :name).and_return('safari')
      expect(helper.is_browser_ie?).to be_falsey
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

  context "#javascript_pf_toolbar_reload" do
    let(:test_tab) { "some_center_tb" }
    subject { helper.javascript_pf_toolbar_reload(test_tab, 'foobar') }

    it "returns javascript to reload toolbar" do
      expect(helper).to receive(:toolbar_from_hash).and_return('foobar')
      is_expected.to include("sendDataWithRx({redrawToolbar: \"foobar\"});")
    end
  end

  context "#set_edit_timer_from_schedule" do
    before(:each) do
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
                                                   :add_root   => true,
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

  describe "update_paging_url_parms", :type => :request do
    before do
      MiqServer.seed
    end

    context "when the given parameter is a hash" do
      before do
        get "/vm/show_list/100", :params => "bc=VMs+running+on+2014-08-25&menu_click=Display-VMs-on_2-6-5&page=2&sb_controller=host"
        allow_any_instance_of(Object).to receive(:query_string).and_return(@request.query_string)
        allow_message_expectations_on_nil
      end

      it "updates the query string with the given hash value and returns the full url path" do
        expect(helper.update_paging_url_parms("show_list", :page => 1)).to eq("/vm/show_list/100?bc=VMs+running+on+2014-08-25"\
          "&menu_click=Display-VMs-on_2-6-5&page=1&sb_controller=host")
      end
    end
    context "when the controller uses restful paths" do
      before do
        FactoryGirl.create(:ems_cloud, :zone => Zone.seed)
        @record = ManageIQ::Providers::CloudManager.first
        get "/ems_cloud/#{@record.id}", :params => { :display => 'images' }
        allow_any_instance_of(Object).to receive(:query_string).and_return(@request.query_string)
        allow_message_expectations_on_nil
      end

      it "uses restful paths for pages" do
        expect(helper.update_paging_url_parms("show", :page => 2)).to eq("/ems_cloud/#{@record.id}?display=images&page=2")
      end
    end
  end

  context "#title_for_cluster_record" do
    before(:each) do
      @ems1 = FactoryGirl.create(:ems_vmware)
      @ems2 = FactoryGirl.create(:ems_openstack_infra)
    end

    it "returns 'Cluster' for non-openstack host" do
      cluster = FactoryGirl.create(:ems_cluster, :ems_id => @ems1.id)

      result = helper.title_for_cluster_record(cluster)
      expect(result).to eq("Cluster")
    end

    it "returns 'Deployment Role' for openstack host" do
      cluster = FactoryGirl.create(:ems_cluster, :ems_id => @ems2.id)

      result = helper.title_for_cluster_record(cluster)
      expect(result).to eq("Deployment Role")
    end
  end

  context "#title_for_host_record" do
    it "returns 'Host' for non-openstack host" do
      host = FactoryGirl.create(:host_vmware, :ext_management_system => FactoryGirl.create(:ems_vmware))

      expect(helper.title_for_host_record(host)).to eq("Host")
    end

    it "returns 'Node' for openstack host" do
      host = FactoryGirl.create(:host_openstack_infra, :ext_management_system => FactoryGirl.create(:ems_openstack_infra))

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
                                       }
                                      )
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
                                       }
                                      )
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
                                       }
                                      )
      result = helper.tree_with_advanced_search?
      expect(result).to be_falsey
    end
  end

  context "#show_adv_search?" do
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
                                       }
                                      )
      result = helper.show_adv_search?
      expect(result).to be_truthy
    end
  end

  context "#show_advanced_search?" do
    it 'should return true for VM explorer trees' do
      controller.instance_variable_set(:@sb,
                                       :active_tree => :vms_instances_filter_tree,
                                       :trees       => {
                                         :vms_instances_filter_tree => {
                                           :tree => :vms_instances_filter_tree,
                                           :type => :vms_instances_filter
                                         }
                                       }
                                      )
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
                                       }
                                      )
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
                                       }
                                      )
      controller.instance_variable_set(:@show_adv_search, true)
      result = helper.show_advanced_search?
      expect(result).to be_truthy
    end
  end

  context "#fileicon_tag" do
    it "returns correct image for miq task record based upon it's status" do
      task = FactoryGirl.create(:miq_task)
      task.state = "Running"
      image = helper.fileicon_tag(task)
      expect(image).to eq("<i class=\"pficon pficon-running\"></i>")
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

  describe '#restful_routed_action?' do
    context 'When controller is Dashboard and action is maintab' do
      it 'returns false' do
        expect(helper.restful_routed_action?('dashboard', 'maintab')).to eq(false)
      end
    end

    context 'When controller is ems_infra and action is show' do
      it 'returns false' do
        expect(helper.restful_routed_action?('ems_infra', 'show')).to eq(true)
      end
    end

    context 'When controller is ems_cloud and action is show_list' do
      it 'returns false' do
        expect(helper.restful_routed_action?('ems_cloud', 'show_list')).to eq(false)
      end
    end

    context 'When controller is ems_cloud and action is show' do
      it 'returns true' do
        expect(helper.restful_routed_action?('ems_cloud', 'show')).to eq(true)
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
         :record     => FactoryGirl.create(:availability_zone),
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
         :record_id  => FactoryGirl.create(:availability_zone).id,
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
        ems = FactoryGirl.create(:ems_kubernetes)
        ContainerProject.create(:ext_management_system => ems, :name => "Test Project")
        expect(helper.multiple_relationship_link(ems, "container_project")).to eq("<li><a title=\"Show Projects\" href=\"/ems_container/#{ems.id}?display=container_projects\">Projects (1)</a></li>")
      end
    end

    context "When record is a Middleware Provider" do
      it "Routes to the controller's show action" do
        stub_user(:features => :all)
        allow(helper).to receive_messages(:controller_name => "ems_middleware")
        ems = FactoryGirl.create(:ems_hawkular)
        MiddlewareDatasource.create(:ext_management_system => ems, :name => "Test Middleware")
        expect(helper.multiple_relationship_link(ems, "middleware_datasource")).to eq("<li><a title=\"Show Middleware \
Datasources\" href=\"/ems_middleware/#{ems.id}?display=middleware_datasources\">Middleware Datasources (1)</a></li>")
      end
    end
  end
end
