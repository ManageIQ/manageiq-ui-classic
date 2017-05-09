require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqReportEdit do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tab => tab, :active_tree => tree} }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:tab) { nil }
  let(:tree) { nil }
  let(:record) { nil }

  describe '#visible?' do
    context 'when active_tree is reports_tree' do
      let(:tree) { :reports_tree }
      context 'and active_tab is report_info' do
        let(:tab) { 'report_info' }
        context 'and record.rpt_type is Custom' do
          let(:record) { FactoryGirl.create(:miq_report, :rpt_type => 'Custom') }
          include_examples 'ApplicationHelper::Button::Basic visible'
        end
        context 'and record.rpt_type is not Custom' do
          let(:record) { FactoryGirl.create(:miq_report) }
          include_examples 'ApplicationHelper::Button::Basic hidden'
        end
      end
      context 'and active_tab is not report_info' do
        let(:tab) { 'not_report_info' }
        include_examples 'ApplicationHelper::Button::Basic hidden'
      end
    end
    context 'when active_tree is not reports_tree' do
      let(:tree) { :not_reports_tree }
      include_examples 'ApplicationHelper::Button::Basic visible'
    end
  end
end
