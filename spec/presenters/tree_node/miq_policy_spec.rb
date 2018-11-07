describe TreeNode::MiqPolicy do
<<<<<<< HEAD
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_policy, :towhat => 'Vm', :active => true, :mode => 'control') }
=======
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryBot.create(:miq_policy, :resource_type => 'Vm', :active => true, :mode => 'control') }
>>>>>>> Rename towhat to resource_type

  include_examples 'TreeNode::Node#key prefix', 'p-'
  include_examples 'TreeNode::Node#text description'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-virtual-machine'
end
