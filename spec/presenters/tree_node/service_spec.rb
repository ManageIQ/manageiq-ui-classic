require 'shared/presenters/tree_node/common'

describe TreeNode::Service do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:service) }

  include_examples 'TreeNode::Node#key prefix', 's-'
  include_examples 'TreeNode::Node#icon', 'product product-service'
end
