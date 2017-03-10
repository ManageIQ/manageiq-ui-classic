shared_examples_for 'a render_report button' do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:html) { false }
  let(:zgraph) { false }
  let(:records_count) { 0 }
  let(:records_total) { {:count => records_count} }
  let(:grouping) { {:_total_ => records_total} }
  let(:report) { FactoryGirl.create(:miq_report, :extras => {:grouping => grouping}) }
  let(:button) { described_class.new(view_context, {}, {'report' => report, 'html' => html, 'zgraph' => zgraph}, {}) }

  describe '#calculate_properties' do
    before { button.calculate_properties }

    shared_examples_for 'a report with tabular or graph view available' do
      context 'when report has data about records' do
        context 'and total number of records is 0' do
          it_behaves_like 'a disabled button', 'No records found for this report'
        end
        context 'and total number of records is more than 0' do
          let(:records_count) { 1 }
          it_behaves_like 'an enabled button'
        end
      end
      context 'when report does not have data about records' do
        let(:grouping) { nil }
        it_behaves_like 'an enabled button'
      end
    end

    context 'when report info is not available' do
      it_behaves_like 'a disabled button', 'No records found for this report'
    end
    context "when report's tabular view is available" do
      let(:html) { '<table><tr><td>Some table</td></tr></table>' }
      it_behaves_like 'a report with tabular or graph view available'
    end
    context "when report's graph view is available" do
      let(:zgraph) { true }
      it_behaves_like 'a report with tabular or graph view available'
    end
  end
end
