describe TreeNode::DialogField do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:dialog_field) }

  include_examples 'TreeNode::Node#key prefix', '-'
  include_examples 'TreeNode::Node#icon', 'ff ff-field'

  describe '#title' do
    it 'returns with the label' do
      expect(subject.text).to eq(object.label)
    end
  end
end
