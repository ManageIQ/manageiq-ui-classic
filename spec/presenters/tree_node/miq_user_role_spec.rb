describe TreeNode::MiqUserRole do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_user_role) }

  include_examples 'TreeNode::Node#key prefix', 'ur-'
  include_examples 'TreeNode::Node#icon', 'ff ff-user-role'
end
