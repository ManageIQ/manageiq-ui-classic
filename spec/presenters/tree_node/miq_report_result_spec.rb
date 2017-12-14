describe TreeNode::MiqReportResult do
  subject { described_class.new(object, nil, {}) }

  let(:object) { FactoryGirl.create(:miq_report_result, :report => {}) }

  include_examples 'TreeNode::Node#key prefix', 'rr-'
  include_examples 'TreeNode::Node#icon', 'fa fa-arrow-right'
end
