require 'shared/presenters/tree_node/common'

describe TreeNode::ChargebackRate do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:chargeback_rate) }

  include_examples 'TreeNode::Node#key prefix', 'cr-'
  include_examples 'TreeNode::Node#icon', 'fa fa-file-text-o'
  include_examples 'TreeNode::Node#title description'
end
