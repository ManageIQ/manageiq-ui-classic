describe TreeNode::MiqReportResult do
  subject { described_class.new(object, nil, nil) }

  let(:object) { FactoryBot.create(:miq_report_result, :report => {}) }

  include_examples 'TreeNode::Node#key prefix', 'rr-'
  include_examples 'TreeNode::Node#icon', 'fa fa-arrow-right'
end
