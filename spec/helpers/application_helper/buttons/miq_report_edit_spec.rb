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
    context 'when active_tree == reports_tree' do
      let(:tree) { :reports_tree }
      context 'and active_tab == report_info' do
        let(:tab) { 'report_info' }
        context 'and record.rpt_type == Custom' do
          let(:record) { FactoryGirl.create(:miq_report, :rpt_type => 'Custom') }
          it { expect(subject.visible?).to be_truthy }
        end
        context 'and record.rpt_type != Custom' do
          let(:record) { FactoryGirl.create(:miq_report) }
          it { expect(subject.visible?).to be_falsey }
        end
      end
      context 'and active_tab != report_info' do
        let(:tab) { 'not_report_info' }
        it { expect(subject.visible?).to be_falsey }
      end
    end
    context 'when active_tree != reports_tree' do
      let(:tree) { :not_reports_tree }
      it { expect(subject.visible?).to be_truthy }
    end
  end
end
