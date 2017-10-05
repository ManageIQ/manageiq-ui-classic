describe ReportController do
  describe "#menu_update" do
    before do
      controller.instance_variable_set(:@edit, :new => {})
      controller.instance_variable_set(:@sb, :new => {})
      controller.instance_variable_set(:@_params, :button => "default")
      tenant = FactoryGirl.create(:tenant, :parent => Tenant.root_tenant, :name => "foo - bar", :subdomain => "foo - bar")
      user = FactoryGirl.create(:user, :tenant => tenant)
      @report = FactoryGirl.create(:miq_report, :rpt_type => "Custom", :miq_group => user.current_group)
      @user = stub_user(:features => :all)
    end

    it "set menus to default and sets correct title for custom reports" do
      expect(controller).to receive(:menu_get_form_vars)
      expect(controller).to receive(:get_tree_data)
      expect(controller).to receive(:replace_right_cell)

      controller.menu_update
      expect(assigns(:edit)[:new]).to eq([["foo - bar (Group): #{@user.current_group.description}", [["Custom", [@report.name]]]]])
      expect(assigns(:flash_array).first[:message]).to include("default")
    end
  end
end
