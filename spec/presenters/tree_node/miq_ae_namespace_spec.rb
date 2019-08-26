describe TreeNode::MiqAeNamespace do
  subject { described_class.new(object, nil, nil) }

  let(:object) { FactoryBot.create(:miq_ae_namespace, :parent => FactoryBot.create(:miq_ae_domain)) }

  include_examples 'TreeNode::Node#key prefix', 'aen-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close'
  include_examples 'TreeNode::Node#tooltip prefix', 'Automate Namespace'
end
