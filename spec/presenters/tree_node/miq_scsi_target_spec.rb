describe TreeNode::MiqScsiTarget do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_scsi_target) }

  include_examples 'TreeNode::Node#key prefix', 'sg-'
  include_examples 'TreeNode::Node#icon', 'ff ff-network-card'
  include_examples 'TreeNode::Node#tooltip prefix', 'Target'

  describe '#title' do
    it 'returns with the title' do
      expect(subject.text).to eq("SCSI Target #{object.target} (#{object.iscsi_name})")
    end
  end
end
