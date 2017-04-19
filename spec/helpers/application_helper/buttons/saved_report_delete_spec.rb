require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::SavedReportDelete do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tree => tree, :active_tab => tab} }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }
  let(:tab) { nil }

  describe '#visible?' do
    context 'when active_tree == reports_tree' do
      let(:tree) { :reports_tree }
      context 'and active_tab == saved_reports' do
        let(:tab) { 'saved_reports' }
        it { expect(subject.visible?).to be_truthy }
      end
      context 'and active_tab != saved_reports' do
        let(:tab) { 'not_saved_reports' }
        it { expect(subject.visible?).to be_falsey }
      end
    end
    context 'when active_tree != reports_tree' do
      let(:tree) { :savedreports_tree }
      it { expect(subject.visible?).to be_truthy }
    end
  end
end
