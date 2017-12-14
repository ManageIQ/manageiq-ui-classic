describe TreeNode::Dialog do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:dialog) }

  include_examples 'TreeNode::Node#key prefix', 'dg-'
  include_examples 'TreeNode::Node#icon', 'fa fa-comment-o'

  describe '#title' do
    it 'returns with the label' do
      expect(subject.text).to eq(object.label)
    end
  end
end
