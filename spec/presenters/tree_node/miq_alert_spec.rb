describe TreeNode::MiqAlert do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_alert) }

  include_examples 'TreeNode::Node#key prefix', 'al-'
  include_examples 'TreeNode::Node#text description'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-warning-triangle-o'
end
