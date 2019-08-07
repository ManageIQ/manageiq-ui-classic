describe TreeNode::MiqAeInstance do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_ae_instance) }

  include_examples 'TreeNode::Node#key prefix', 'aei-'
  include_examples 'TreeNode::Node#icon', 'fa fa-file-text-o'
  include_examples 'TreeNode::Node#tooltip prefix', 'Automate Instance'
end
