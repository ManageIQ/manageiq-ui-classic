describe TreeNode::MiqDialog do
  subject { described_class.new(object, nil, {}) }
  let(:object) { FactoryGirl.create(:miq_dialog) }

  include_examples 'TreeNode::Node#key prefix', 'odg-'
  include_examples 'TreeNode::Node#icon', 'fa fa-comment-o'
  include_examples 'TreeNode::Node#text description'
end
