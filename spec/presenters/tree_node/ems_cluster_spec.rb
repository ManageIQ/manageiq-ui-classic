describe TreeNode::EmsCluster do
  subject { described_class.new(object, nil, nil) }

  %i(ems_cluster ems_cluster_openstack).each do |factory|
    klass = FactoryBot.factory_by_name(factory).instance_variable_get(:@class_name)
    context(klass) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'c-'
      include_examples 'TreeNode::Node#icon', 'pficon pficon-cluster'
      include_examples 'TreeNode::Node#tooltip prefix', 'Cluster / Deployment Role'
    end
  end
end
