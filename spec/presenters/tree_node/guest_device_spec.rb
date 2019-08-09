describe TreeNode::GuestDevice do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:guest_device, :controller_type => 'foo') }

  include_examples 'TreeNode::Node#key prefix', 'gd-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-unknown'
  include_examples 'TreeNode::Node#tooltip prefix', 'foo Storage Adapter'

  context 'ethernet' do
    let(:object) { FactoryBot.create(:guest_device_nic) }

    include_examples 'TreeNode::Node#key prefix', 'gd-'
    include_examples 'TreeNode::Node#icon', 'ff ff-network-card'
    include_examples 'TreeNode::Node#tooltip prefix', 'Physical NIC'
  end
end
