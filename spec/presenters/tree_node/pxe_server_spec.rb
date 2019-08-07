describe TreeNode::PxeServer do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:pxe_server) }

  include_examples 'TreeNode::Node#key prefix', 'ps-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-server'
end
