require 'shared/presenters/tree_node/common'

describe TreeNode::ScanItemSet do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:scan_item_set) }

  include_examples 'TreeNode::Node#icon', 'fa fa-search'
end
