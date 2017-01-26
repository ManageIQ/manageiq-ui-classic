require 'shared/presenters/tree_node/common'

describe TreeNode::MiqWidget do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:miq_widget) }

  include_examples 'TreeNode::Node#key prefix', '-'
  include_examples 'TreeNode::Node#icon', 'fa fa-file-text-o'

  describe '#tooltip' do
    it 'returns with the same as node title' do
      expect(subject.tooltip).to eq(subject.title)
    end
  end
end
