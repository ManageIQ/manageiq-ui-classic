describe TreeNode::IsoImage do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:iso_image) }

  include_examples 'TreeNode::Node#key prefix', 'isi-'
  include_examples 'TreeNode::Node#icon', 'ff ff-network-card'
end
