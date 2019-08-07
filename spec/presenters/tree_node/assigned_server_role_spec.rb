describe TreeNode::AssignedServerRole do
  include_context 'server roles'
  let(:object) { assigned_server_role }
  let(:tree) { double }
  subject { described_class.new(object, nil, tree) }

  before { allow(tree).to receive(:root) }

  describe '#title' do
    it 'returns with the title' do
      expect(subject.text).to eq("<strong>Role: SmartProxy</strong> (primary, active, PID=)")
    end
  end

  include_examples 'TreeNode::Node#key prefix', 'asr-'
end
