describe TreeNode::Switch do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:switch, :name => "light") }

  include_examples 'TreeNode::Node#key prefix', 'sw-'
  include_examples 'TreeNode::Node#icon', 'ff ff-network-switch'
  include_examples 'TreeNode::Node#tooltip prefix', 'Switch'
end
