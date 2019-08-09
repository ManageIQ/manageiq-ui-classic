describe TreeNode::Snapshot do
  subject { described_class.new(object, nil, nil) }
  let(:object) do
    EvmSpecHelper.local_miq_server
    vm = FactoryBot.create(:vm_vmware)
    FactoryBot.create(:snapshot, :create_time => 1.minute.ago, :vm_or_template => vm, :name => 'polaroid')
  end

  include_examples 'TreeNode::Node#key prefix', 'sn-'
  include_examples 'TreeNode::Node#icon', 'fa fa-camera'
  include_examples 'TreeNode::Node#tooltip same as #text'
end
