describe TreeNode::MiqScsiLun do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_scsi_lun, :canonical_name => 'foo') }

  include_examples 'TreeNode::Node#key prefix', 'sl-'
  include_examples 'TreeNode::Node#icon', 'fa fa-database'
  include_examples 'TreeNode::Node#tooltip prefix', 'LUN'

  describe '#title' do
    it 'returns with the canonical name' do
      expect(subject.text).to eq(object.canonical_name)
    end
  end
end
