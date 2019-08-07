describe TreeNode::ConfigurationScriptBase do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:ansible_configuration_script) }

  include_examples 'TreeNode::Node#key prefix', 'cf-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-template'
  include_examples 'TreeNode::Node#tooltip prefix', 'Job Template (Ansible Tower)'
end
