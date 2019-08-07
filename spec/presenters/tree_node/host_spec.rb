describe TreeNode::Host do
  subject { described_class.new(object, nil, nil) }

  %i(
    host
    host_microsoft
    host_redhat
    host_openstack_infra
    host_vmware
    host_vmware_esx
  ).each do |factory|
    klass = FactoryBot.factory_by_name(factory).instance_variable_get(:@class_name)
    context(klass) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'h-'
      include_examples 'TreeNode::Node#icon', 'pficon pficon-container-node'
      include_examples 'TreeNode::Node#tooltip prefix', 'Host / Node'
    end
  end
end
