describe TreeNode::MiqGroup do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_group) }

  include_examples 'TreeNode::Node#key prefix', 'g-'
  include_examples 'TreeNode::Node#icon', 'ff ff-group'
end
