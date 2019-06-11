describe ReportController do
  describe "#menu_update" do
    let(:user) { FactoryBot.create(:user_with_group) }
    let(:report) { FactoryBot.create(:miq_report, :rpt_type => "Default", :rpt_group => 'foo - bar', :miq_group => user.current_group) }

    before do
      controller.instance_variable_set(:@edit, :new => {})
      controller.instance_variable_set(:@sb, :new => {})
      controller.params = {:button => "default"}
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

    context "report menu set to default" do
      it "clears the report_menus from the selected group settings" do
        controller.instance_variable_set(:@sb, :new => {}, :menu_default => true)
        controller.params = {:button => "save"}

        expect(controller).to receive(:menu_get_form_vars)
        expect(controller).to receive(:get_tree_data)
        expect(controller).to receive(:replace_right_cell)

        expect(MiqGroup).to receive(:find_by).and_return(user.current_group)
        user.current_group[:settings] = { "report_menus" => 'foo' }

        controller.menu_update

        expect(user.current_group[:settings]["report_menus"]).to be_nil
      end
    end
  end
end
