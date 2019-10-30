describe TreeNode::AvailabilityZone do
  subject { described_class.new(object, nil, nil) }

  %i(
    availability_zone_amazon
    availability_zone_azure
    availability_zone_google
    availability_zone_openstack
    availability_zone_openstack_null
    availability_zone_vmware
  ).each do |factory|
    context(factory.to_s) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'az-'
      include_examples 'TreeNode::Node#icon', 'pficon pficon-zone'
      include_examples 'TreeNode::Node#tooltip prefix', 'Availability Zone'
    end
  end
end
