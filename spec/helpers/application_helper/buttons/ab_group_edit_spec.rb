require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::AbGroupEdit do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { Hash.new }
  let(:props) { {:child_id => 'ab_group_edit', :options => {:action => 'edited'}} }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  describe '#disabled?' do
    context 'when button group is unassigned' do
      let(:x_node) { 'xx-ub' }
      it { expect(subject.disabled?).to be_truthy }
    end
    context 'when button group is not unassigned' do
      let(:x_node) { 'xx-ab_12345' }
      it { expect(subject.disabled?).to be_falsey }
    end
  end
end
