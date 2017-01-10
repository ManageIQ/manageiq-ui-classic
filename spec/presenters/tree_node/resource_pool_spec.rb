require 'shared/presenters/tree_node/common'

describe TreeNode::ResourcePool do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:resource_pool) }

  include_examples 'TreeNode::Node#key prefix', 'r-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-resource-pool'
end
