describe TreeNode::ConfigurationProfile do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:configuration_profile_foreman) }

  include_examples 'TreeNode::Node#key prefix', 'cp-'
  include_examples 'TreeNode::Node#icon', 'fa fa-list-ul'
  include_examples 'TreeNode::Node#tooltip prefix', 'Configuration Profile'
end
