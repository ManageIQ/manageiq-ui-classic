require 'shared/presenters/tree_node/common'

describe TreeNode::Lan do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:lan) }

  include_examples 'TreeNode::Node#key prefix', 'l-'
  include_examples 'TreeNode::Node#icon', 'product product-switch'
  include_examples 'TreeNode::Node#tooltip prefix', 'Port Group'
end
