describe TreeNode::ServiceResource do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:service_resource) }

  include_examples 'TreeNode::Node#key prefix', 'sr-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-template'
end
