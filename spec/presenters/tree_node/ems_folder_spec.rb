describe TreeNode::EmsFolder do
  subject { described_class.new(object, nil, options, nil) }
  let(:options) { {} }

  %i(
    ems_folder
    storage_cluster
    inventory_group
    inventory_root_group
  ).each do |factory|
    klass = FactoryBot.factory_by_name(factory).instance_variable_get(:@class_name)
    context(klass) do
      let(:object) { FactoryBot.create(factory) }

      include_examples 'TreeNode::Node#key prefix', 'f-'
      include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close'
      include_examples 'TreeNode::Node#tooltip prefix', 'Folder'

      context 'type is vat' do
        let(:options) { {:tree => :vat_tree} }

        include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close-blue'
      end
    end
  end
end
