describe TreeNode::MiqSearch do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_search) }

  include_examples 'TreeNode::Node#key prefix', 'ms-'
  include_examples 'TreeNode::Node#icon', 'fa fa-filter'
  include_examples 'TreeNode::Node#text description'
  include_examples 'TreeNode::Node#tooltip prefix', 'Filter'
end
