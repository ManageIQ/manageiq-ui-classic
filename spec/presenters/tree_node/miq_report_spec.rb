require 'shared/presenters/tree_node/common'

describe TreeNode::MiqReport do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:miq_report) }

  include_examples 'TreeNode::Node#key prefix', 'rep-'
  include_examples 'TreeNode::Node#icon', 'product product-report'
end
