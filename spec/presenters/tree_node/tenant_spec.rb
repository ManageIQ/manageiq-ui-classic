describe TreeNode::Tenant do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:tenant) }

  include_examples 'TreeNode::Node#key prefix', 'tn-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-tenant'
end
