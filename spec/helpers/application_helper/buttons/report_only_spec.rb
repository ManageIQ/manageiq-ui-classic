require 'shared/helpers/application_helper/buttons/render_report'

describe ApplicationHelper::Button::ReportOnly do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record, 'report' => report, 'report_result_id' => report_result_id} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:miq_report_result, :miq_report_result_details => []) }
  let(:report) { FactoryGirl.create(:miq_report, :miq_report_results => []) }
  let(:report_result_id) { record.id }
  let(:result_detail) { FactoryGirl.create(:miq_report_result_detail, :miq_report_result_id => report_result_id) }

  describe '#calculate_properties' do
    let(:setup_report_result_details) { record.miq_report_result_details << result_detail if record }
    before do
      setup_report_result_details
      subject.calculate_properties
    end

    context 'when record not present' do
      let(:record) { nil }
      include_examples 'ApplicationHelper::Button::RenderReport#calculate_properties'
    end
    context 'when record is present' do
      context 'and record has report' do
        context 'and record has report_result_id' do
          context 'and report has result details' do
            include_examples 'ApplicationHelper::Button::Basic enabled'
          end
          context 'and report has no result details' do
            let(:setup_report_result_details) {}
            include_examples 'ApplicationHelper::Button::Basic disabled',
                             :error_message => 'No records found for this report'
          end
        end
        context 'and record does not have report_result_id' do
          let(:report_result_id) { nil }
          include_examples 'ApplicationHelper::Button::Basic disabled',
                           :error_message => 'No records found for this report'
        end
      end
      context 'and record does not have report' do
        let(:report) { nil }
        include_examples 'ApplicationHelper::Button::Basic disabled',
                         :error_message => 'No records found for this report'
      end
    end
  end
end
