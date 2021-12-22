describe TreeNode::Root do
  subject { described_class.new(object, nil, nil) }
  let(:object) { {} }

  include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close'

  describe '#key' do
    it { expect(subject.key).to eq('root') }
  end
end
