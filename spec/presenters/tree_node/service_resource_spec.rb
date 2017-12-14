describe TreeNode::ServiceResource do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:service_resource) }

  include_examples 'TreeNode::Node#key prefix', 'sr-'
  include_examples 'TreeNode::Node#icon', 'ff ff-template'
end
