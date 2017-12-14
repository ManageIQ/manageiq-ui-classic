describe TreeNode::PxeImageType do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:pxe_image_type) }

  include_examples 'TreeNode::Node#key prefix', 'pit-'
  include_examples 'TreeNode::Node#icon', 'ff ff-network-card'
end
