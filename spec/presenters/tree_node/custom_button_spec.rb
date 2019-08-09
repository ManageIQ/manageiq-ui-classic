describe TreeNode::CustomButton do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:custom_button, :applies_to_class => 'Host') }

  include_examples 'TreeNode::Node#key prefix', 'cb-'
  include_examples 'TreeNode::Node#icon', 'fa fa-file-o'

  describe '#tooltip' do
    it 'returns with prefix Button: and description' do
      expect(subject.tooltip).to eq("Button: #{object.description}")
    end
  end
end
