describe TreeNode::ScanItemSet do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:scan_item_set) }

  include_examples 'TreeNode::Node#icon', 'fa fa-search'
end
