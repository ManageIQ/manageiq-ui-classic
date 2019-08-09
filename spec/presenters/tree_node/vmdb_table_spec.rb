describe TreeNode::VmdbTable do
  let(:object) { FactoryBot.create(:vmdb_table_evm, :name => 'foo') }
  subject { described_class.new(object, nil, nil) }

  include_examples 'TreeNode::Node#key prefix', 'tb-'
  include_examples 'TreeNode::Node#icon', 'fa fa-table'
end
