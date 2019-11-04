describe TreeNode::EmsCluster do
  subject { described_class.new(object, nil, nil) }

  %i(ems_cluster ems_cluster_openstack).each do |factory|
    context(factory.to_s) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'c-'
      include_examples 'TreeNode::Node#icon', 'pficon pficon-cluster'
      include_examples 'TreeNode::Node#tooltip prefix', 'Cluster / Deployment Role'
    end
  end
end
