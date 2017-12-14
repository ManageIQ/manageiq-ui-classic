describe TreeNode::Storage do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:storage) }

  include_examples 'TreeNode::Node#key prefix', 'ds-'
  include_examples 'TreeNode::Node#icon', 'fa fa-database'
end
