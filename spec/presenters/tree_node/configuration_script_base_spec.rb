require 'shared/presenters/tree_node/common'

describe TreeNode::ConfigurationScriptBase do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:ansible_configuration_script) }

  include_examples 'TreeNode::Node#key prefix', 'cf-'
  include_examples 'TreeNode::Node#icon', 'product product-template'
  include_examples 'TreeNode::Node#tooltip prefix', 'Ansible Tower Job Template'
end
