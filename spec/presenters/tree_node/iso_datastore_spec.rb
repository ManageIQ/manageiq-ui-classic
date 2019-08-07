describe TreeNode::IsoDatastore do
  subject { described_class.new(object, nil, nil) }
  let(:object) { FactoryBot.create(:iso_datastore) }

  include_examples 'TreeNode::Node#key prefix', 'isd-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-server'
end
