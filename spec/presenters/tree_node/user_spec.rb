describe TreeNode::User do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:user) }

  include_examples 'TreeNode::Node#key prefix', 'u-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-user'
end
