describe TreeNode::MiqAlertSet do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_alert_set) }

  include_examples 'TreeNode::Node#key prefix', 'ap-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-warning-triangle-o'
end
