require ManageIQ::UI::Classic::Engine.root.join("spec/helpers/report_helper_spec.rb")

describe ReportController do
  before { allow(controller).to receive(:data_for_breadcrumbs).and_return({}) }

  context "ReportController::Schedules" do
    let(:miq_report) { FactoryBot.create(:miq_report) }

    before do
      @current_user = login_as FactoryBot.create(:user, :features => %w(miq_report_schedule_enable
                                                                         miq_report_schedule_disable
                                                                         miq_report_schedule_edit))
      allow(User).to receive(:server_timezone).and_return("UTC")
    end

    context "no schedules selected" do
      before do
        allow(controller).to receive(:find_checked_items).and_return([])
      end

      it "#miq_report_schedule_enable" do
        expect { controller.miq_report_schedule_enable }.to raise_error("Can't access records without an id")
      end

      it "#miq_report_schedule_disable" do
        expect { controller.miq_report_schedule_disable }.to raise_error("Can't access records without an id")
      end
    end

    context "normal case" do
      before do
        server = double
        allow(server).to receive_messages(:zone_id => 1)
        allow(MiqServer).to receive(:my_server).and_return(server)

        @sch = FactoryBot.create(:miq_schedule, :enabled => true, :updated_at => 1.hour.ago.utc)

        allow(controller).to receive(:find_records_with_rbac).and_return([@sch])
        expect(controller).to receive(:render).never
        expect(controller).to receive(:schedule_get_all)
        expect(controller).to receive(:replace_right_cell)
      end

      it "#miq_report_schedule_enable" do
        @sch.update_attribute(:enabled, false)

        controller.miq_report_schedule_enable
        expect(controller.send(:flash_errors?)).not_to be_truthy
        @sch.reload
        expect(@sch).to be_enabled
        expect(@sch.updated_at).to be > 10.minutes.ago.utc
      end

      it "#miq_report_schedule_disable" do
        controller.miq_report_schedule_disable
        expect(controller.send(:flash_errors?)).not_to be_truthy
        @sch.reload
        expect(@sch).not_to be_enabled
        expect(@sch.updated_at).to be > 10.minutes.ago.utc
      end

      it "contains current group id in sched_action field" do
        controller.params = {:button => "add",
                             :controller => "report",
                             :action => "schedule_edit"}
        controller.miq_report_schedule_disable
        allow(controller).to receive_messages(:load_edit => true)
        allow(controller).to receive(:replace_right_cell)
        timer = ReportHelper::Timer.new('Once', 1, 1, 1, 1, '12/04/2015', '00', '00')
        controller.instance_variable_set(:@edit,
                                         :sched_id => nil, :new => {:name => "test_1", :description => "test_1",
                                                                    :enabled => true, :send_email => false,
                                                                    :email => {:send_if_empty => true},
                                                                    :timer => timer,
                                                                    :filter => "Configuration Management",
                                                                    :subfilter => "Virtual Machines",
                                                                    :repfilter => miq_report.id},
                                         :key => "schedule_edit__new")
        controller.instance_variable_set(:@sb, :trees => {:schedules_tree => {:schedules_tree => "root"}})
        controller.send(:schedule_edit)
        miq_schedule = MiqSchedule.find_by(:name => "test_1")
        expect(miq_schedule.sched_action).to be_kind_of(Hash)
        expect(miq_schedule.sched_action[:method]).to eq("run_report")
        expect(miq_schedule.sched_action[:options]).to be_kind_of(Hash)
        expect(miq_schedule.sched_action[:options][:miq_group_id]).to eq(@current_user.current_group.id)
      end
    end
  end

  describe 'x_button' do
    before do
      stub_user(:features => :all)
      ApplicationController.handle_exceptions = true
    end

    describe 'corresponding methods are called for allowed actions' do
      ReportController::REPORT_X_BUTTON_ALLOWED_ACTIONS.each_pair do |action_name, method|
        it "calls the appropriate method: '#{method}' for action '#{action_name}'" do
          expect(controller).to receive(method)
          get :x_button, :params => { :pressed => action_name }
        end
      end
    end

    it 'exception is raised for unknown action' do
      get :x_button, :params => { :pressed => 'random_dude', :format => :html }
      expect(response).to render_template('layouts/exception')
    end
  end

  describe "import/export accordion" do
    include_context "valid session"
    render_views

    before do
      login_as user_with_feature(%w(miq_report_export))
      allow(controller).to receive(:x_active_tree) { :export_tree }
    end

    context "accordion root" do
      it "correctly renders the screen for accordion root" do
        allow(controller).to receive(:x_node) { 'root' }
        post :tree_select, :params => {'id' => 'root'}
        expect(response.status).to eq(200)
        expect(response.body).to include('Choose a Import/Export type from the menus on the left.')
      end
    end

    context "widgets import/export node" do
      it "correctly renders the widget import/export screen" do
        allow(controller).to receive(:x_node) { 'xx-exportwidgets' }
        post :tree_select, :params => {'id' => 'xx-exportwidgets'}
        expect(response.status).to eq(200)
        expect(response.body).to include('Widgets')
        expect(response.body).to match(/input.+type=.+submit.+value=.+Export.+/)
      end
    end

    context "custom reports import/export node" do
      it "correctly renders the custom reports import/export screen" do
        allow(controller).to receive(:x_node) { 'xx-exportcustomreports' }
        post :tree_select, :params => {'id' => 'xx-exportcustomreports'}
        expect(response.body).to include('Custom Reports')
        expect(response.status).to eq(200)
        expect(response.body).to match(/input.+type=.+submit.+value=.+Export.+/)
      end
    end
  end

  describe "#export_widgets" do
    include_context "valid session"

    let(:params) { {:widgets => widget_list} }

    before do
      stub_user(:features => :all)
      bypass_rescue
    end

    context "when there are widget parameters" do
      let(:widget_list) { %w(1 2 3) }
      let(:widget_yaml) { "the widget yaml" }
      let(:widgets) { [double("MiqWidget")] }

      before do
        records = widgets
        allow(MiqWidget).to receive(:where).with(:id => widget_list).and_return(records)
        allow(MiqWidget).to receive(:export_to_yaml).with(widgets, MiqWidget).and_return(widget_yaml)
      end

      it "sends the data" do
        get :export_widgets, :params => params
        expect(response.body).to eq("the widget yaml")
      end

      it "sets the filename to the current date" do
        Timecop.freeze(2013, 1, 2) do
          get :export_widgets, :params => params
          expect(response.header['Content-Disposition']).to include("widget_export_20130102_000000.yml")
        end
      end
    end

    context "when there are not widget parameters" do
      let(:widget_list) { nil }

      it "sets a flash message" do
        get :export_widgets, :params => params
        expect(assigns(:flash_array))
          .to eq([{:message => "At least 1 item must be selected for export",
                   :level   => :error}])
      end

      it "sets the flash array on the sandbox" do
        get :export_widgets, :params => params
        expect(assigns(:sb)[:flash_msg])
          .to eq([{:message => "At least 1 item must be selected for export",
                   :level   => :error}])
      end

      it "redirects to the explorer" do
        get :export_widgets, :params => params
        expect(response).to redirect_to(:action => :explorer)
      end
    end
  end

  describe "#upload_widget_import_file" do
    include_context "valid session"

    let(:widget_import_service) { double("WidgetImportService") }

    before do
      stub_user(:features => :all)
      bypass_rescue
      allow(controller).to receive(:x_node) { 'xx-exportwidgets' }
      controller.instance_variable_set(:@in_a_form, true)
    end

    shared_examples_for "ReportController#upload_widget_import_file that does not upload a file" do
      it "returns with a warning message" do
        post :upload_widget_import_file, :params => params, :xhr => true
        expect(controller.instance_variable_get(:@flash_array))
          .to include(:message => "Use the Choose file button to locate an import file", :level => :warning)
      end
    end

    context "when an upload file is given" do
      let(:filename) { "filename" }
      let(:file) { fixture_file_upload("files/dummy_file.yml", "text/yml") }
      let(:params) { {:upload => {:file => file}} }

      before do
        allow(WidgetImportService).to receive(:new).and_return(widget_import_service)
        login_as(FactoryBot.create(:user))
      end

      context "when the widget importer does not raise an error" do
        let(:ret) { FactoryBot.build(:import_file_upload, :id => '123') }

        before do
          allow(ret).to receive(:widget_list).and_return([])
          allow(widget_import_service).to receive(:store_for_import).with("the yaml data\n").and_return(ret)
        end

        it "returns with an import file upload id" do
          post :upload_widget_import_file, :params => params, :xhr => true
          expect(controller.instance_variable_get(:@flash_array))
            .to include(:message => "Import file was uploaded successfully", :level => :success)
          expect(controller.instance_variable_get(:@import_file_upload_id)).to eq(123)
        end

        it "imports the widgets" do
          expect(widget_import_service).to receive(:store_for_import).with("the yaml data\n")
          post :upload_widget_import_file, :params => params, :xhr => true
        end
      end

      context "when the widget importer raises an import error" do
        before do
          allow(widget_import_service).to receive(:store_for_import).and_raise(WidgetImportValidator::NonYamlError)
        end

        it "returns with an error message" do
          post :upload_widget_import_file, :params => params, :xhr => true
          expect(controller.instance_variable_get(:@flash_array))
            .to include(:message => "Error: the file uploaded is not of the supported format", :level => :error)
        end
      end

      context "when the widget importer raises a non valid widget yaml error" do
        before do
          allow(widget_import_service).to receive(:store_for_import)
            .and_raise(WidgetImportValidator::InvalidWidgetYamlError)
        end

        it "returns with an error message" do
          post :upload_widget_import_file, :params => params, :xhr => true
          expect(controller.instance_variable_get(:@flash_array))
            .to include(:message => "Error: the file uploaded contains no widgets", :level => :error)
        end
      end
    end

    context "when the upload parameter is nil" do
      let(:params) { {} }

      it_behaves_like "ReportController#upload_widget_import_file that does not upload a file"
    end

    context "when an upload file is not given" do
      let(:params) { {:upload => {:file => nil}} }

      it_behaves_like "ReportController#upload_widget_import_file that does not upload a file"
    end
  end

  describe "#import_widgets" do
    include_context "valid session"

    let(:widget_import_service) { double("WidgetImportService") }

    before do
      stub_user(:features => :all)
      bypass_rescue
      allow(controller).to receive(:x_node) { 'xx-exportwidgets' }
      controller.instance_variable_set(:@in_a_form, true)
    end

    context "when the commit button is used" do
      let(:params) { {:import_file_upload_id => "123", :widgets_to_import => ["potato"], :commit => 'Commit'} }

      before do
        allow(ImportFileUpload).to receive(:where).with(:id => "123").and_return([import_file_upload])
        allow(WidgetImportService).to receive(:new).and_return(widget_import_service)
      end

      shared_examples_for "ReportController#import_widgets" do
        it "returns a status of 200" do
          post :import_widgets, :params => params, :xhr => true
          expect(response.status).to eq(200)
        end
      end

      context "when the import file upload exists" do
        let(:import_file_upload) { double("ImportFileUpload") }

        before do
          allow(widget_import_service).to receive(:import_widgets)
        end

        it_behaves_like "ReportController#import_widgets"

        it "imports the data" do
          expect(widget_import_service).to receive(:import_widgets).with(import_file_upload, ["potato"])
          post :import_widgets, :params => params, :xhr => true
        end

        it "returns the flash message" do
          allow(widget_import_service).to receive(:import_widgets).and_return(1)
          post :import_widgets, :params => params, :xhr => true
          expect(controller.instance_variable_get(:@flash_array))
            .to include(:message => "1 widget imported successfully", :level => :success)
        end
      end

      context "when the import file upload does not exist" do
        let(:import_file_upload) { nil }

        it_behaves_like "ReportController#import_widgets"

        it "returns the flash message" do
          post :import_widgets, :params => params, :xhr => true
          expect(controller.instance_variable_get(:@flash_array))
            .to include(:message => "Error: Widget import file upload expired", :level => :error)
        end
      end
    end

    context "when the cancel button is used" do
      let(:params) { {:import_file_upload_id => "123", :commit => 'Cancel'} }

      before do
        allow(WidgetImportService).to receive(:new).and_return(widget_import_service)
        allow(widget_import_service).to receive(:cancel_import)
      end

      it "cancels the import" do
        expect(widget_import_service).to receive(:cancel_import).with("123")
        post :import_widgets, :params => params, :xhr => true
      end

      it "returns a 200" do
        post :import_widgets, :params => params, :xhr => true
        expect(response.status).to eq(200)
      end

      it "returns the flash messages" do
        post :import_widgets, :params => params, :xhr => true
        expect(controller.instance_variable_get(:@flash_array))
          .to include(:message => "Widget import cancelled", :level => :info)
      end
    end
  end

  context "#report_selection_menus" do
    before do
      menu = [
        ["Trending", ["Hosts", ["Report 1", "Report 2"]]]
      ]
      controller.instance_variable_set(:@menu, menu)
      controller.instance_variable_set(:@edit,
                                       :new => {
                                         :filter    => "Trending",
                                         :subfilter => "Hosts"
                                       })
      report1 = double("MiqReport",
                       :name => 'Report 1',
                       :id   => 1,
                       :db   => 'VimPerformanceTrend')
      report2 = double("MiqReport",
                       :name => 'Report 2',
                       :id   => 2,
                       :db   => 'VimPerformanceTrend')

      expect(MiqReport).to receive(:where).and_return([report1, report2])
    end

    it "Verify that Trending reports are excluded in widgets editor" do
      controller.instance_variable_set(:@sb, :active_tree => :widgets_tree)
      controller.send(:report_selection_menus)
      expect(assigns(:reps)).to eq([])
    end

    it "Verify that Trending reports are included in schedule menus editor" do
      controller.instance_variable_set(:@sb, :active_tree => :schedules_tree)
      controller.send(:report_selection_menus)
      expect(assigns(:reps).count).to eq(2)
      expect(assigns(:reps)).to eq([["Report 1", 1], ["Report 2", 2]])
    end
  end

  describe "#replace_right_cell" do
    before do
      FactoryBot.create(:tenant, :parent => Tenant.root_tenant)
      login_as FactoryBot.create(:user_admin) # not sure why this needs to be an admin...

      controller.instance_variable_set(:@sb,
                                       :trees       => {'reports_tree'      => {:active_node => "root"},
                                                        'savedreports_tree' => {:active_node => "root"},
                                                        'widgets_tree'      => {:active_node => "root"},
                                                        'db_tree'           => {:active_node => "root"},
                                                        'schedules_tree'    => {:active_node => "root"}},
                                       :active_tree => :reports_tree)

      allow(controller).to receive(:x_node) { 'root' }
      allow(controller).to receive(:get_node_info)

      expect(controller).to receive(:render)
    end

    let(:sb) { controller.instance_variable_get(:@sb) }

    it "sanitizes the title when editing report menus" do
      sb[:node_clicked] = true
      presenter = ExplorerPresenter.new(:active_tree => :roles_tree)
      expect(ExplorerPresenter).to receive(:new).and_return(presenter)
      allow(controller).to receive(:x_active_tree).and_return(:roles_tree)
      session[:node_selected] = 'foo__<div><iframe/>bar</div>'
      controller.send(:replace_right_cell, :menu_edit_action => 'g')
      legend = presenter.instance_variable_get(:@options)[:element_updates][:menu1_legend][:legend]
      expect(legend).to eq("Manage Folders in &quot;&lt;div&gt;&lt;iframe/&gt;bar&lt;/div&gt;&quot;")
    end

    it "should rebuild trees when last report result is newer than last tree build time" do
      # report is newer, set build_time first
      sb[:rep_tree_build_time] = Time.now.utc
      FactoryBot.create(:miq_report_with_results)

      expect(controller).to receive(:build_reports_tree)
      expect(controller).to receive(:build_savedreports_tree)
      expect(controller).to receive(:build_db_tree)
      expect(controller).to receive(:build_widgets_tree)

      controller.send(:replace_right_cell)
    end

    it "should not rebuild trees which weren't previously built, even though newer" do
      # report is newer, set build_time first
      sb[:rep_tree_build_time] = Time.now.utc
      FactoryBot.create(:miq_report_with_results)

      sb[:trees].delete('db_tree')
      sb[:trees].delete('widgets_tree')

      expect(controller).to receive(:build_reports_tree)
      expect(controller).to receive(:build_savedreports_tree)
      expect(controller).not_to receive(:build_db_tree)
      expect(controller).not_to receive(:build_widgets_tree)

      controller.send(:replace_right_cell)
    end

    it "should not rebuild trees when last report result is older than last tree build time" do
      # report is older, set build_time after
      FactoryBot.create(:miq_report_with_results)
      sb[:rep_tree_build_time] = Time.now.utc

      expect(controller).not_to receive(:build_reports_tree)
      expect(controller).not_to receive(:build_savedreports_tree)
      expect(controller).not_to receive(:build_db_tree)
      expect(controller).not_to receive(:build_widgets_tree)

      controller.send(:replace_right_cell)
    end

    it "should rebuild trees reports tree when replace_trees is passed in" do
      # even tho rebuild_trees is false, it should still rebuild reports tree because
      # {:replace_trees => [:reports]} is passed in

      # report is older, set build_time after
      FactoryBot.create(:miq_report_with_results)
      sb[:rep_tree_build_time] = Time.now.utc

      expect(controller).to receive(:build_reports_tree)
      expect(controller).not_to receive(:build_savedreports_tree)
      expect(controller).not_to receive(:build_db_tree)
      expect(controller).not_to receive(:build_widgets_tree)

      controller.send(:replace_right_cell, :replace_trees => [:reports])
    end

    it "Can build all the trees" do
      EvmSpecHelper.local_miq_server
      sb[:rep_tree_build_time] = Time.now.utc
      MiqReport.seed
      MiqWidget.seed
      MiqWidgetSet.seed
      user2 = create_user_with_group('User-2', "Group-1", MiqUserRole.find_by(:name => "EvmRole-operator"))
      @rpt = create_and_generate_report_for_user("Vendor and Guest OS", user2)

      expect(controller).to receive(:reload_trees_by_presenter).with(
        instance_of(ExplorerPresenter),
        array_including(
          instance_of(TreeBuilderReportReports),
          instance_of(TreeBuilderReportSavedReports),
          instance_of(TreeBuilderReportSchedules),
          instance_of(TreeBuilderReportWidgets),
          instance_of(TreeBuilderReportDashboards)
        )
      )
      controller.send(:replace_right_cell, :replace_trees => %i(reports schedules savedreports db widgets))
    end
  end

  context "#rebuild_trees" do
    before do
      login_as FactoryBot.create(:user_admin) # not sure why this needs to be an admin...
    end

    it "rebuild trees, latest report result was created after last time tree was built" do
      last_build_time = Time.now.utc
      controller.instance_variable_set(:@sb, :rep_tree_build_time => last_build_time)
      FactoryBot.create(:miq_report_with_results)
      res = controller.send(:rebuild_trees)
      expect(res).to be(true)
      expect(assigns(:sb)[:rep_tree_build_time]).not_to eq(last_build_time)
    end

    it "don't rebuild trees, latest report result was created before last time tree was built" do
      FactoryBot.create(:miq_report_with_results)
      last_build_time = Time.now.utc
      controller.instance_variable_set(:@sb, :rep_tree_build_time => last_build_time)
      res = controller.send(:rebuild_trees)
      expect(res).to be(false)
      expect(assigns(:sb)[:rep_tree_build_time]).to eq(last_build_time)
    end
  end

  describe "#get_all_saved_reports" do
    before do
      EvmSpecHelper.local_miq_server
    end

    context "when generating reports" do
      render_views
      let(:rpt) { FactoryBot.create(:miq_report) }

      before do
        stub_user(:features => :all)

        seed_session_trees('report', :reports_tree, "xx-0_xx-0-1_rep-#{rpt.id}")
        session[:sandboxes]["report"][:rep_tree_build_time] = rpt.created_on
        session[:sandboxes]["report"][:active_accord] = :reports
        allow(controller).to receive(:data_for_breadcrumbs).and_return([{:title => "title", :action => "action", :key => "key"}])
      end

      it "runs report and calls GTL generation" do
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'MiqReportResult',
          :report_data_additional_options => {
            :named_scope => [[:with_current_user_groups_and_report, rpt.id.to_s]],
            :model       => 'MiqReportResult'
          }
        )

        post :x_button, :params => { :pressed => 'miq_report_run', :id => rpt.id }

        expect(response.status).to eq(200)
      end
    end

    context "User1 has Group1(current group: Group1), User2 has Group1, Group2(current group: Group2)" do
      before do
        EvmSpecHelper.local_miq_server

        MiqUserRole.seed
        role = MiqUserRole.find_by(:name => "EvmRole-operator")

        # User1 with 2 groups(Group1,Group2), current group for User2 is Group2
        @user2 = create_user_with_group('User-2', "Group-1", role)

        @user1 = create_user_with_group('User-1', "Group-2", role)
        @user1.miq_groups << MiqGroup.where(:description => "Group-1")
        login_as @user1
      end

      context "User2 generates report under Group1" do
        before do
          os = OperatingSystem.create(:name => "RHEL 7", :product_name => "RHEL7")
          FactoryBot.create(:vm_vmware, :operating_system => os)
          @rpt = create_and_generate_report_for_user("Vendor and Guest OS", @user2)
        end

        it "is allowed to see miq report result for User1(with current group Group2)" do
          report_result_id = @rpt.miq_report_results.first.id
          controller.params = {:id => report_result_id,
                               :controller => "report",
                               :action => "explorer"}
          controller.instance_variable_set(:@sb, {})
          controller.instance_variable_set(:@settings, :perpage => { :reports => 20 })
          allow(controller).to receive(:get_all_reps)
          controller.send(:show_saved_report, report_result_id)

          fetched_report_result_id = controller.instance_variable_get(:@report_result_id)
          expect(fetched_report_result_id).to eq(@rpt.miq_report_results.first.id)

          fetched_report    = controller.instance_variable_get(:@report)
          fetched_report.id = @rpt.id # Reports serialized into the report column don't have ids
          expect(fetched_report).to eq(@rpt)
        end
      end
    end
  end

  describe "#populate_reports_menu" do
    let(:user) { FactoryBot.create(:user_with_group) }
    let(:sandbox) { {} }

    before do
      EvmSpecHelper.local_miq_server
      login_as user
    end

    it 'sets the sandbox' do
      controller.instance_variable_set(:@sb, sandbox)
      expect(controller).to receive(:get_reports_menu).and_return('yay')
      controller.send(:populate_reports_menu)
      expect(sandbox[:rpt_menu]).to eq('yay')
    end
  end

  describe '#get_reports_menu' do
    let(:group) { FactoryBot.create(:miq_group, :settings => settings) }
    let(:settings) { {:report_menus => []} }

    before do
      controller.instance_variable_set(:@sb, {})
    end

    context 'custom menus configured' do
      it 'retrieves the custom menu' do
        expect(controller).not_to receive(:default_reports_menu)
        controller.send(:get_reports_menu, true, group)
      end
    end

    context 'custom menus not configured' do
      let(:settings) { nil }
      it 'returns with the default menu' do
        expect(controller).to receive(:default_reports_menu)
        controller.send(:get_reports_menu, true, group)
      end
    end

    context 'custom reports included' do
      let(:user) { FactoryBot.create(:user_with_group) }
      let(:menu) { controller.instance_variable_get(:@sb)[:rpt_menu] }
      subject { controller.send(:get_reports_menu, false, user.current_group) }

      before do
        EvmSpecHelper.local_miq_server
        login_as user
        FactoryBot.create(:miq_report, :rpt_type => "Custom", :miq_group => user.current_group)
      end

      it 'returns with the correct name for custom folder' do
        expect(subject.first.first).to eq("#{user.current_tenant.name} (Group): #{user.current_group.name}")
      end
    end
  end

  context "GenericSessionMixin" do
    let(:report_tab) { 'report_tab' }
    let(:report_result_id) { 'report_result_id' }
    let(:menu) { 'menu' }
    let(:folders) { 'folders' }
    let(:ght_type) { 'ght_type' }
    let(:report_groups) { 'report_groups' }
    let(:edit) { 'edit' }
    let(:catinfo) { 'catinfo' }
    let(:grid_folders) { 'gridfolders' }
    let(:report_lastaction) { 'lastaction' }
    let(:report_display) { 'display' }
    let(:report_filters) { 'filters' }
    let(:report_showtype) { 'showtype' }
    let(:panels) { 'panels' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:report_tab          => report_tab,
                                                          :report_result_id    => report_result_id,
                                                          :report_menu         => menu,
                                                          :report_folders      => folders,
                                                          :ght_type            => ght_type,
                                                          :report_groups       => report_groups,
                                                          :edit                => edit,
                                                          :vm_catinfo          => catinfo,
                                                          :report_grid_folders => grid_folders,
                                                          :report_lastaction   => report_lastaction,
                                                          :report_display      => report_display,
                                                          :report_filters      => report_filters,
                                                          :report_showtype     => report_showtype)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@report_tab)).to eq(report_tab)
        expect(controller.instance_variable_get(:@report_result_id)).to eq(report_result_id)
        expect(controller.instance_variable_get(:@menu)).to eq(menu)
        expect(controller.instance_variable_get(:@folders)).to eq(folders)
        expect(controller.instance_variable_get(:@ght_type)).to eq(ght_type)
        expect(controller.instance_variable_get(:@report_groups)).to eq(report_groups)
        expect(controller.instance_variable_get(:@edit)).to eq(edit)
        expect(controller.instance_variable_get(:@catinfo)).to eq(catinfo)
        expect(controller.instance_variable_get(:@grid_folders)).to eq(grid_folders)
        expect(controller.instance_variable_get(:@lastaction)).to eq(report_lastaction)
        expect(controller.instance_variable_get(:@display)).to eq(report_display)
        expect(controller.instance_variable_get(:@filters)).to eq(report_filters)
        expect(controller.instance_variable_get(:@showtype)).to eq(report_showtype)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@report_tab, report_tab)
        controller.instance_variable_set(:@report_result_id, report_result_id)
        controller.instance_variable_set(:@menu, menu)
        controller.instance_variable_set(:@folders, folders)
        controller.instance_variable_set(:@ght_type, ght_type)
        controller.instance_variable_set(:@report_groups, report_groups)
        controller.instance_variable_set(:@catinfo, catinfo)
        controller.instance_variable_set(:@grid_folders, grid_folders)
        controller.instance_variable_set(:@lastaction, report_lastaction)
        controller.instance_variable_set(:@display, report_display)
        controller.instance_variable_set(:@filters, report_filters)
        controller.instance_variable_set(:@showtype, report_showtype)
        controller.instance_variable_set(:@panels, panels)
        controller.send(:set_session_data)

        expect(controller.session[:report_tab]).to eq(report_tab)
        expect(controller.session[:report_result_id]).to eq(report_result_id)
        expect(controller.session[:report_menu]).to eq(menu)
        expect(controller.session[:report_folders]).to eq(folders)
        expect(controller.session[:ght_type]).to eq(ght_type)
        expect(controller.session[:report_groups]).to eq(report_groups)
        expect(controller.session[:vm_catinfo]).to eq(catinfo)
        expect(controller.session[:report_grid_folders]).to eq(grid_folders)
        expect(controller.session[:report_lastaction]).to eq(report_lastaction)
        expect(controller.session[:report_display]).to eq(report_display)
        expect(controller.session[:report_filters]).to eq(report_filters)
        expect(controller.session[:report_showtype]).to eq(report_showtype)
        expect(controller.session[:panels]).to eq(panels)
      end
    end
  end

  context 'saved reports' do
    describe '#accordion_select?' do
      subject { controller.send(:accordion_select?, param) }

      context 'an accord' do
        let(:param) { "foo_accord" }
        it { is_expected.to be_truthy }
      end

      context 'a number' do
        let(:param) { "1234" }
        it { is_expected.to be_falsey }
      end
    end
  end

  context 'displaying reports' do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      allow(controller).to receive(:server_timezone).and_return('UTC')
      @user2 = create_user_with_group('User-2', "Group-1", MiqUserRole.find_by(:name => "EvmRole-operator"))
    end

    describe "#print_report" do
      render_views

      let(:report_result_id) do
        report = create_and_generate_report_for_user("Vendor and Guest OS", @user2)
        report.miq_report_results.first.id
      end

      it 'renders the print layout' do
        get :print_report, :params => {:id => report_result_id}
        expect(response).to render_template('layouts/print/report')
      end
    end

    describe "report_print_options" do
      it 'returns the print options' do
        report = create_and_generate_report_for_user("Vendor and Guest OS", @user2)
        result = report.miq_report_results.first

        expect(controller.send(:report_print_options, report, result)).to match(
          :page_layout => 'landscape',
          :page_size   => report.page_size || 'a4',
          :run_date    => format_timezone(result.last_run_on, result.user_timezone, "gtl"),
          :title       => result.name
        )
      end
    end
  end
end
