describe TreeNode::MiqWidgetSet do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:miq_widget_set, :name => 'foo') }

  include_examples 'TreeNode::Node#key prefix', '-'
  include_examples 'TreeNode::Node#icon', 'fa fa-tachometer'
  include_examples 'TreeNode::Node#tooltip same as #text'
end
