require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqCapacity do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tab => tab} }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  describe '#visible?' do
    context 'when active_tab == report' do
      let(:tab) { 'report' }
      it { expect(subject.visible?).to be_truthy }
    end
    context 'when active_tab != report' do
      let(:tab) { 'not_report' }
      it { expect(subject.visible?).to be_falsey }
    end
  end
end
