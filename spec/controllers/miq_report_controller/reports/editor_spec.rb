describe ReportController do
  describe "::Reports::Editor" do
    describe '#reportable_models' do
      subject { controller.send(:reportable_models) }

      it 'does not contain duplicate items' do
        duplicates = subject.group_by(&:first).select { |_, v| v.size > 1 }.map(&:first)
        expect(duplicates).to be_empty
      end
    end

    describe "#miq_report_edit" do
      it "should allow user with miq_report_edit access to edit a report" do
        user = FactoryBot.create(:user, :features => %w(miq_report_edit))
        login_as user
        EvmSpecHelper.seed_specific_product_features(%w(miq_report_edit))
        ApplicationController.handle_exceptions = true

        rep = FactoryBot.create(
          :miq_report,
          :rpt_type   => "Custom",
          :miq_group  => user.current_group,
          :db         => "Host",
          :name       => 'name',
          :title      => 'title',
          :db_options => {},
          :col_order  => ["name"],
          :headers    => ["Name"],
          :tz         => nil
        )
        allow(controller).to receive(:javascript_redirect)
        controller.instance_variable_set(:@sb, {})
        controller.params = {:id => rep.id}
        controller.send(:miq_report_edit)
        expect(controller).to have_received(:javascript_redirect)
      end

      it "should allow user with miq_report_new access to add a new report" do
        login_as FactoryBot.create(:user, :features => %w(miq_report_new))
        EvmSpecHelper.seed_specific_product_features(%w(miq_report_new))
        ApplicationController.handle_exceptions = true

        allow(controller).to receive(:javascript_redirect)
        controller.instance_variable_set(:@sb, {})
        controller.params = {:pressed => 'miq_report_new'}
        controller.send(:miq_report_edit)
        expect(controller).to have_received(:javascript_redirect)
      end
    end
  end
end
