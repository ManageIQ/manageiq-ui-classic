require 'shared/presenters/tree_node/common'

describe TreeNode::MiqAction do
  subject { described_class.new(object, nil, :tree => :action_tree) }
  let(:object) { FactoryGirl.create(:miq_action, :name => 'raise_automation_event', :action_type => 'default') }

  include_examples 'TreeNode::Node#key prefix', 'a-'
  include_examples 'TreeNode::Node#title description'
  include_examples 'TreeNode::Node#icon', 'product product-action'
end
