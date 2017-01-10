require 'shared/presenters/tree_node/common'

describe TreeNode::MiqReportResult do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:miq_report_result) }

  include_examples 'TreeNode::Node#key prefix', 'rr-'
  include_examples 'TreeNode::Node#icon', 'product product-arrow-right'
end
