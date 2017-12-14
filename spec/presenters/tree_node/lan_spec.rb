describe TreeNode::Lan do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:lan) }

  include_examples 'TreeNode::Node#key prefix', 'l-'
  include_examples 'TreeNode::Node#icon', 'ff ff-network-switch'
  include_examples 'TreeNode::Node#tooltip prefix', 'Port Group'
end
