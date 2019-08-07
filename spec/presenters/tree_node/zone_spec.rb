describe TreeNode::Zone do
  before { EvmSpecHelper.local_miq_server }
  let(:object) { FactoryBot.create(:zone, :name => "foo") }
  subject { described_class.new(object, nil, nil) }

  include_examples 'TreeNode::Node#key prefix', 'z-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-zone'
  include_examples 'TreeNode::Node#tooltip same as #text'
end
