describe ReportController do
  describe "#schedule_edit" do
    let(:admin_user) { FactoryBot.create(:user, :role => "super_administrator") }

    let(:schedule) { FactoryBot.create(:miq_schedule, :name => "tester1") }
    let(:report) { FactoryBot.create(:miq_report, :name => "report1") }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as admin_user

      schedule
      FactoryBot.create(:miq_schedule, :name => "tester2")

      allow(controller).to receive(:assert_privileges)
      allow(controller).to receive(:replace_right_cell).and_return(true)

      timer = ReportHelper::Timer.new('hourly', 1, 1, 1, 1, Time.now.utc, '00', '00')
      edit = {:key      => "schedule_edit__#{schedule.id}",
              :sched_id => schedule.id,
              :new      => {:name => "foo", :description => "Foo", :repfilter => report.id, :timer => timer}}
      controller.instance_variable_set(:@edit, edit)
      controller.instance_variable_set(:@sb, {})
      session[:edit] = edit
      allow(controller).to receive(:drop_breadcrumb)
    end

    it "reset rbac testing" do
      controller.params = {:button => "reset", :id => schedule.id}
      controller.send(:schedule_edit)
      expected_id = controller.instance_variable_get(:@schedule).id
      expect(expected_id).to eq(schedule.id)
    end

    it "sets params accord only when schedule is added from Reports accordion" do
      allow(controller).to receive(:x_active_accord).and_return(:reports)
      post :schedule_edit, :params => { :button => "add", :id => schedule.id }
      params = ActionController::Parameters.new('button'     => 'add',
                                                'id'         => schedule.id.to_s,
                                                'controller' => 'report',
                                                'action'     => 'schedule_edit',
                                                'accord'     => 'schedules')
      expect(controller.params).to eq(params)
    end

    it "does not set params accord when adding/editing schedule from Schedules accordion" do
      allow(controller).to receive(:x_active_accord).and_return(:schedules)
      post :schedule_edit, :params => { :button => "add", :id => schedule.id }
      params = ActionController::Parameters.new('button'     => 'add',
                                                'id'         => schedule.id.to_s,
                                                'controller' => 'report',
                                                'action'     => 'schedule_edit')
      expect(controller.params).to eq(params)
    end
  end
end
