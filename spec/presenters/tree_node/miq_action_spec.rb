describe TreeNode::MiqAction do
  subject { described_class.new(object, nil, :tree => :action_tree) }
  let(:object) { FactoryBot.create(:miq_action, :name => 'raise_automation_event', :action_type => 'default') }

  include_examples 'TreeNode::Node#key prefix', 'a-'
  include_examples 'TreeNode::Node#text description'
  include_examples 'TreeNode::Node#icon', 'ff ff-action'
end
