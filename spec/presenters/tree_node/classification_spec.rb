describe TreeNode::Classification do
  subject { described_class.new(object, nil, nil) }

  shared_examples 'TreeNode::Classification' do
    include_examples 'TreeNode::Node#key prefix', 'cl-'
    include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close'
    include_examples 'TreeNode::Node#text description'

    describe '#hide_checkbox' do
      it 'returns with true' do
        expect(subject.send(:hide_checkbox)).to be_truthy
      end
    end

    describe '#selectable' do
      it 'returns with false' do
        expect(subject.send(:selectable)).to be_falsey
      end
    end
  end

  context 'Classification' do
    let(:object) { FactoryBot.create(:classification) }
    it_behaves_like 'TreeNode::Classification'
  end

  context 'Category' do
    let(:object) { FactoryBot.create(:category) }
    it_behaves_like 'TreeNode::Classification'
  end
end
