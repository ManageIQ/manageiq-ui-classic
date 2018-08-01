describe TreeNode::ConfiguredSystem do
  subject { described_class.new(object, nil, {}) }

  {
    :configured_system               => 'cs-',
    :configured_system_foreman       => 'csf-',
    :configured_system_ansible_tower => 'csa-'
  }.each do |factory, prefix|
    klass = FactoryGirl.factory_by_name(factory).instance_variable_get(:@class_name)
    context(klass) do
      let(:object) { FactoryGirl.create(factory) }

      include_examples 'TreeNode::Node#key prefix', prefix
      include_examples 'TreeNode::Node#icon', 'ff ff-configured-system'
      include_examples 'TreeNode::Node#tooltip prefix', 'Configured System'
    end
  end
end
