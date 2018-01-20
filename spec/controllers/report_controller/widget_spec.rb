describe ReportController do
  context "#widget_set_form_vars" do
    let!(:report) do
      FactoryGirl.create(:miq_report, :name => "custom report 1", :rpt_group => "Custom", :rpt_type => "Custom", :col_order => [])
    end

    before do
      user = FactoryGirl.create(:user_with_group)
      allow(user).to receive(:get_timezone).and_return(Time.zone)
      allow(user).to receive(:admin_user?).and_return(true)
      login_as user
      allow(controller).to receive(:current_user).and_return(user)

      allow(MiqServer).to receive(:my_server) { FactoryGirl.create(:miq_server) }
    end

    shared_examples "Report Widget @menu" do
      before do
        controller.instance_variable_set(:@sb, {:nodes => ['?', 'r']})
      end

      it "contains custom reports" do
        controller.instance_variable_set(:@widget, widget)
        controller.send(:widget_set_form_vars)
        expect(controller.instance_variable_get(:@menu).map(&:first)).to include("My Company (All Groups)")
      end
    end

    context "new" do
      let(:widget) { FactoryGirl.build(:miq_widget, :content_type => "report") }
      it_behaves_like "Report Widget @menu"
    end

    context "edit" do
      let(:widget) { FactoryGirl.create(:miq_widget, :content_type => "report", :resource => report) }
      it_behaves_like "Report Widget @menu"
    end
  end
end
