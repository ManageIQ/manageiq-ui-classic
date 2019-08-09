describe TreeNode::Datacenter do
  let(:object) { FactoryBot.create(:datacenter) }
  subject { described_class.new(object, nil, nil) }

  include_examples 'TreeNode::Node#key prefix', 'dc-'
  include_examples 'TreeNode::Node#icon', 'fa fa-building-o'
  include_examples 'TreeNode::Node#tooltip prefix', 'Datacenter'
end
