describe ReportController do
  context "#widget_set_form_vars" do
    let!(:report) do
      FactoryBot.create(:miq_report, :name => "custom report 1", :rpt_group => "Custom", :rpt_type => "Custom", :col_order => [])
    end

    before do
      user = FactoryBot.create(:user_with_group)
      allow(user).to receive(:get_timezone).and_return(Time.zone)
      allow(user).to receive(:report_admin_user?).and_return(true)
      login_as user
      allow(controller).to receive(:current_user).and_return(user)

      allow(MiqServer).to receive(:my_server) { FactoryBot.create(:miq_server) }
    end

    shared_examples "Report Widget @menu" do
      before do
        controller.instance_variable_set(:@sb, :nodes => ['?', 'r'])
      end

      it "contains custom reports" do
        controller.instance_variable_set(:@widget, widget)
        controller.send(:widget_set_form_vars)
        expect(controller.instance_variable_get(:@menu).map(&:first)).to include("My Company (All Groups)")
      end
    end

    context "new" do
      let(:widget) { FactoryBot.build(:miq_widget, :content_type => "report") }
      it_behaves_like "Report Widget @menu"
    end

    context "edit" do
      let(:widget) { FactoryBot.create(:miq_widget, :content_type => "report", :resource => report) }
      it_behaves_like "Report Widget @menu"
    end
  end

  context "#widget_set_record_vars" do
    let(:zone) { double("Zone", :name => "foo") }
    let(:server) { double("MiqServer", :logon_status => :ready, :id => 1, :my_zone => zone) }

    before do
      allow(MiqServer).to receive(:my_server).and_return(server)
      allow(server).to receive(:zone_id).and_return(1)
      @widget = FactoryBot.build(:miq_widget, :content_type => "report")
      report = FactoryBot.create(:miq_report, :name => "custom report 1", :col_order => [])
      schedule = FactoryBot.build(:miq_schedule)
      timer = ReportHelper::Timer.new('Hourly', 1, 1, 1, 1, '11/13/2015', '00', '10')
      controller.instance_variable_set(:@sb, :wtype => 'r')
      @edit_hash = {
        :rpt      => report,
        :schedule => schedule,
        :new      => {
          :name        => 'Fred',
          :description => 'FRED',
          :row_count   => 10,
          :timer       => timer
        }
      }
      controller.instance_variable_set(:@edit, @edit_hash)
      session[:edit] = @edit_hash
    end

    it "sets role visibility for widget" do
      role = FactoryBot.create(:miq_user_role, :name => "foo")
      @edit_hash[:new][:visibility_typ] = 'role'
      @edit_hash[:new][:roles] = [role.id.to_s]
      controller.send(:widget_set_record_vars, @widget)
      expect(@widget.visibility[:roles]).to eq([role.name])
    end

    it "sets group visibility for widget" do
      group = FactoryBot.create(:miq_group, :description => "foo_group")
      @edit_hash[:new][:visibility_typ] = 'group'
      @edit_hash[:new][:groups] = [group.id.to_s]
      controller.send(:widget_set_record_vars, @widget)
      expect(@widget.visibility[:groups]).to eq([group.description])
    end
  end
end
