describe TreeNode::ServerRole do
  include_context 'server roles'
  let(:object) { server_role }
  subject { described_class.new(object, nil, nil) }

  include_examples 'TreeNode::Node#key prefix', 'role-'
  include_examples 'TreeNode::Node#icon', 'ff ff-user-role'

  describe '#title' do
    it 'returns with title' do
      expect(subject.text).to eq("Role: SmartProxy (stopped)")
    end
  end
end
