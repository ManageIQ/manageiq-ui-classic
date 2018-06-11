describe ReportController do
  describe "#schedule_edit" do
    let(:admin_user) { FactoryGirl.create(:user, :role => "super_administrator") }

    let(:schedule) { FactoryGirl.create(:miq_schedule, :name => "tester1") }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as admin_user

      schedule
      FactoryGirl.create(:miq_schedule, :name => "tester2")

      allow(controller).to receive(:assert_privileges)
      allow(controller).to receive(:checked_or_params).and_return(MiqSchedule.all.ids)
      allow(controller).to receive(:replace_right_cell).and_return(true)
    end

    it "reset rbac testing" do
      controller.send(:schedule_edit)
      controller.instance_variable_set(:@_params, :button => "reset")
      expected_id = controller.instance_variable_get(:@schedule).id
      expect(expected_id).to eq(schedule.id)
    end
  end
end
