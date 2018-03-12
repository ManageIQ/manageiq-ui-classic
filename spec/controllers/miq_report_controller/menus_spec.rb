describe ReportController do
  describe "#menu_update" do
    let(:user) { FactoryGirl.create(:user_with_group) }
    let(:report) { FactoryGirl.create(:miq_report, :rpt_type => "Default", :rpt_group => 'foo - bar', :miq_group => user.current_group) }

    before do
      controller.instance_variable_set(:@edit, :new => {})
      controller.instance_variable_set(:@sb, :new => {})
      controller.instance_variable_set(:@_params, :button => "default")
      allow(controller).to receive(:current_user).and_return(user)
      login_as user
      report
    end

    it "set menus to default and sets correct title for custom reports" do
      expect(controller).to receive(:menu_get_form_vars)
      expect(controller).to receive(:build_menu_roles_tree)
      expect(controller).to receive(:get_tree_data)
      expect(controller).to receive(:replace_right_cell)

      controller.menu_update
      expect(assigns(:edit)[:new]).to eq([["foo", [["bar", [report.name]]]]])
      expect(assigns(:flash_array).first[:message]).to include("default")
    end
  end
end
