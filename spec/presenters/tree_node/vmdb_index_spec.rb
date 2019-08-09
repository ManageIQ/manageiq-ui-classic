describe TreeNode::VmdbIndex do
  let(:object) { FactoryBot.create(:vmdb_index, :name => 'foo') }
  subject { described_class.new(object, nil, nil) }

  include_examples 'TreeNode::Node#key prefix', 'ti-'
  include_examples 'TreeNode::Node#icon', 'fa fa-table'
end
