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
    context(factory.to_s) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'h-'
      include_examples 'TreeNode::Node#icon', 'pficon pficon-container-node'
      include_examples 'TreeNode::Node#tooltip prefix', 'Host'
    end
  end
end
