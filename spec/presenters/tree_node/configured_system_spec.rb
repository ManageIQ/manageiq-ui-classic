describe TreeNode::ConfiguredSystem do
  subject { described_class.new(object, nil, nil) }

  %i(
    configured_system
    configured_system_foreman
    configured_system_ansible_tower
  ).each do |factory|
    context(factory.to_s) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'cs-'
      include_examples 'TreeNode::Node#icon', 'ff ff-configured-system'
      include_examples 'TreeNode::Node#tooltip prefix', 'Configured System'
    end
  end
end
