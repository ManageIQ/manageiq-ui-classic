describe ApplicationHelper::Button::ReportOnly do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:result_detail) { FactoryBot.create(:miq_report_result_detail, :miq_report_result_id => report_result_id) }
  let(:record) { FactoryBot.create(:miq_report_result, :miq_report_result_details => []) }
  let(:report) { FactoryBot.create(:miq_report, :miq_report_results => []) }
  let(:report_result_id) { record.id }
  let(:instance_data) { {'record' => record, 'report' => report, 'report_result_id' => report_result_id} }
  let(:button) { described_class.new(view_context, {}, instance_data, {}) }

  describe '#disabled?' do
    let(:setup_report_result_details) { record.miq_report_result_details << result_detail if record }
    before do
      setup_report_result_details
    end

    context 'when record not present' do
      let(:record) { nil }
      it_behaves_like 'a render_report button'
    end
    context 'when record is present' do
      context 'and record has report' do
        context 'and record has report_result_id' do
          context 'and report has result details' do
            it_behaves_like 'an enabled button'
          end
          context 'and report has no result details' do
            let(:setup_report_result_details) {}
            it_behaves_like 'a disabled button', 'No records found for this report'
          end
        end
        context 'and record does not have report_result_id' do
          let(:report_result_id) { nil }
          it_behaves_like 'a disabled button', 'No records found for this report'
        end
      end
      context 'and record does not have report' do
        let(:report) { nil }
        it_behaves_like 'a disabled button', 'No records found for this report'
      end
    end
  end
end
