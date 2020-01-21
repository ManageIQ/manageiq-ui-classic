describe ApplicationHelper::Button::UtilizationDownload do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:report) { FactoryBot.create(:miq_report, :miq_report_results => []) }

  context "Utilization explorer" do
    let(:button) { described_class.new(view_context, {}, {'layout' => 'miq_capacity_utilization'}, {}) }

    before do
      button.instance_variable_set(:@sb, :active_tab => "report", :trend_rpt => report)
      allow(view_context).to receive(:x_active_tree).and_return(:utilization_tree)
    end

    context '#disabled?' do
      it 'when report tab has no data available' do
        report.table = OpenStruct.new(:data => [])
        expect(button.disabled?).to be(true)
      end

      it 'when report tab has data and @sb[:summary] is not set' do
        report.table = OpenStruct.new(:data => [:foo => 'bar'])
        expect(button.disabled?).to be(true)
      end

      it 'when report tab has data and @sb[:summary] is set' do
        button.instance_variable_set(:@sb, :active_tab => "report", :trend_rpt => report, :summary => "is set")
        report.table = OpenStruct.new(:data => [:foo => 'bar'])
        expect(button.disabled?).to be(false)
      end

      it 'when on summary tab' do
        button.instance_variable_set(:@sb, :active_tab => "summary", :trend_rpt => report)
        report.table = OpenStruct.new(:data => [:foo => 'bar'])
        expect(button.disabled?).to be(true)
      end
    end
  end
end
