describe TreeNode::EmsFolder do
  let(:tree) { nil }
  subject { described_class.new(object, nil, tree) }

  %i(
    ems_folder
    storage_cluster
    inventory_group
    inventory_root_group
  ).each do |factory|
    context(factory.to_s) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'f-'
      include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close'
      include_examples 'TreeNode::Node#tooltip prefix', 'Folder'
    end
  end
end
