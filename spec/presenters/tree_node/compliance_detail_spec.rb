describe TreeNode::ComplianceDetail do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:compliance_detail, :miq_policy_result => result) }
  let(:result) { true }

  include_examples 'TreeNode::Node#key prefix', 'cd-'

  describe '#title' do
    it 'returns with the title' do
      expect(subject.text).to eq("<strong>Policy: </strong>#{object.miq_policy_desc}")
    end
  end

  context 'passed compliance' do
    include_examples 'TreeNode::Node#icon', 'pficon pficon-ok'
  end

  context 'failed compliance' do
    let(:result) { false }
    include_examples 'TreeNode::Node#icon', 'pficon pficon-error-circle-o'
  end
end
