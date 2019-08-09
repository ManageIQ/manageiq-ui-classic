describe TreeNode::PhysicalServer do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:physical_server) }

  include_examples 'TreeNode::Node#key prefix', 'phys-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-server'
end
