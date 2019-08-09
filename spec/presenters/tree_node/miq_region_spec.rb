describe TreeNode::MiqRegion do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_region, :description => 'Elbonia') }

  include_examples 'TreeNode::Node#key prefix', 'mr-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-regions'
  include_examples 'TreeNode::Node#text description'

  describe '#expand' do
    it 'returns with true' do
      expect(subject.expand).to be_truthy
    end
  end
end
