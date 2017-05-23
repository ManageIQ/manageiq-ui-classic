require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DialogAddElement do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'edit' => edit} }
  let(:props) { Hash.new }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  context 'when edit' do
    let(:edit) { true }
    context 'and nodes.length < 3' do
      let(:x_node) { 'xx_11' }
      it { expect(subject.visible?).to be_falsey }
    end
    context 'and nodes.length == 3' do
      let(:x_node) { 'xx_aa_11' }
      it { expect(subject.visible?).to be_truthy }
    end
    context 'and nodes.length == 4' do
      let(:x_node) { 'xx_aa_11_22' }
      it { expect(subject.visible?).to be_truthy }
    end
    context 'and nodes.length > 4' do
      let(:x_node) { 'xx_aa_11_22_33' }
      it { expect(subject.visible?).to be_falsey }
    end
  end

  context 'when edit == nil' do
    let(:edit) { nil }
    let(:x_node) { 'does_not_matter' }
    it { expect(subject.visible?).to be_falsey }
  end
end
