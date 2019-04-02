describe TreeNode::MiqPolicy do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryBot.create(:miq_policy, :towhat => 'Vm', :active => true, :mode => 'control') }

  include_examples 'TreeNode::Node#key prefix', 'p-'
  include_examples 'TreeNode::Node#text description'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-virtual-machine'
end
