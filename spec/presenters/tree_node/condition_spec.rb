describe TreeNode::Condition do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:condition) }

  include_examples 'TreeNode::Node#key prefix', 'co-'
  include_examples 'TreeNode::Node#icon', 'fa fa-diamond'
end
