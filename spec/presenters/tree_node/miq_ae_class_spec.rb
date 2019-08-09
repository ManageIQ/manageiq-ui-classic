describe TreeNode::MiqAeClass do
  subject { described_class.new(object, nil, nil) }
  let(:object) do
    ns = FactoryBot.create(:miq_ae_namespace)
    FactoryBot.create(:miq_ae_class, :namespace_id => ns.id)
  end

  include_examples 'TreeNode::Node#key prefix', 'aec-'
  include_examples 'TreeNode::Node#icon', 'ff ff-class'
  include_examples 'TreeNode::Node#tooltip prefix', 'Automate Class'
end
