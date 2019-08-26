describe TreeNode::REXML::Attribute do
  subject { described_class.new(object, nil, nil) }
  let(:object) { REXML::Attribute.new("name", "value") }

  include_examples 'TreeNode::Node#icon', 'ff ff-attribute'
end
