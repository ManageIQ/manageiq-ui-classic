describe TreeNode::MiqServer do
  before { EvmSpecHelper.local_miq_server }
  subject { described_class.new(object, nil, nil) }
  let(:object) do
    zone = FactoryBot.create(:zone)
    FactoryBot.create(:miq_server, :zone => zone)
  end

  include_examples 'TreeNode::Node#key prefix', 'svr-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-server'
  include_examples 'TreeNode::Node#tooltip same as #text'

  describe '#title' do
    it 'returns with the title' do
      expect(subject.text).to eq("Server: #{object.name} [#{object.id}]")
    end
  end

  describe '#expand' do
    it 'returns with true' do
      expect(subject.expand).to be_truthy
    end
  end
end
