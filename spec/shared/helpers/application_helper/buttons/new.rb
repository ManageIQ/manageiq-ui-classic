require 'shared/helpers/application_helper/buttons/basic'

# shared contexts for buttons with _new or _discover suffixes
shared_context 'ApplicationHelper::Button::New' do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'lastaction' => lastaction, 'display' => display} }
  let(:props) { Hash.new }
  let(:lastaction) { '' }
  let(:display) { '' }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }
end

shared_context 'ApplicationHelper::Button::New#visible?' do
  context 'when button is present on a sublist view screen of a CI' do
    let(:lastaction) { 'show' }
    %w(main vms instances all_vms).each do |display|
      context "and display == #{display}" do
        let(:display) { display }
        it { expect(subject.visible?).to be_truthy }
      end
      context 'and display is sublist-like' do
        it { expect(subject.visible?).to be_falsey }
      end
    end
  end
end
