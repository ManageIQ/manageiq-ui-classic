describe TreeNode::MiqReport do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_report) }

  include_examples 'TreeNode::Node#key prefix', 'rep-'
  include_examples 'TreeNode::Node#icon', 'fa fa-file-text-o'
end
