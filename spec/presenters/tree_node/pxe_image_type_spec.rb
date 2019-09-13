describe TreeNode::PxeImageType do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:pxe_image_type) }

  include_examples 'TreeNode::Node#key prefix', 'pit-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-image'
end
