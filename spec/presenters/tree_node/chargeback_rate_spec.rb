describe TreeNode::ChargebackRate do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:chargeback_rate) }

  include_examples 'TreeNode::Node#key prefix', 'cr-'
  include_examples 'TreeNode::Node#icon', 'fa fa-file-text-o'
  include_examples 'TreeNode::Node#text description'
end
