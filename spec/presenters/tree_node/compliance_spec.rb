describe TreeNode::Compliance do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:compliance, :compliant => compliant) }
  let(:compliant) { true }

  include_examples 'TreeNode::Node#key prefix', 'cm-'

  describe '#title' do
    it 'returns with the title' do
      expect(subject.text).to eq("<strong>Compliance Check on: </strong>#{object.timestamp}")
    end
  end

  context 'passed compliance' do
    include_examples 'TreeNode::Node#icon', 'pficon pficon-ok'
  end

  context 'failed compliance' do
    let(:compliant) { false }
    include_examples 'TreeNode::Node#icon', 'pficon pficon-error-circle-o'
  end
end
