describe TreeNode::MiqAction do
  subject { described_class.new(object, nil, {:tree => :action_tree}, nil) }
  let(:object) { MiqAction.find_by(:name => 'raise_automation_event', :action_type => 'default') }

  include_examples 'TreeNode::Node#key prefix', 'a-'
  include_examples 'TreeNode::Node#text description'
  include_examples 'TreeNode::Node#icon', 'ff ff-action'
end
