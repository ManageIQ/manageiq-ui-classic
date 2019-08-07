describe TreeNode::DialogTab do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:dialog_tab) }

  include_examples 'TreeNode::Node#key prefix', '-'
  include_examples 'TreeNode::Node#icon', 'ff ff-tab'

  describe '#title' do
    it 'returns with the label' do
      expect(subject.text).to eq(object.label)
    end
  end
end
