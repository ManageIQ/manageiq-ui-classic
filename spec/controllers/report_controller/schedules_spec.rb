describe ReportController do
  describe "#schedule_edit" do
    let(:admin_user) { FactoryGirl.create(:user, :role => "super_administrator")}
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as admin_user
      allow(User).to receive(:current_user).and_return(admin_user)
      
      FactoryGirl.create(:miq_schedule, :name => "tester1")
      FactoryGirl.create(:miq_schedule, :name => "tester2")
      
      allow(controller).to receive(:assert_privileges)
      allow(controller).to receive(:checked_or_params).and_return(MiqSchedule.all.ids)
      controller.instance_variable_set(:@_params, {:button => "reset"})
      allow(controller).to receive(:replace_right_cell).and_return(true)
    end
    it "testing" do
      controller.send(:schedule_edit)
      expected_id = controller.instance_variable_get(:@schedule).id
      expect(expected_id).to eq((MiqSchedule.find_by! name: "tester1").id)
    end
  end
end
