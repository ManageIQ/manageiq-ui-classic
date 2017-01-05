require 'shared/presenters/tree_node/common'

describe TreeNode::Condition do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:condition) }

  include_examples 'TreeNode::Node#key prefix', 'co-'
  include_examples 'TreeNode::Node#icon', 'product product-miq_condition'
end
