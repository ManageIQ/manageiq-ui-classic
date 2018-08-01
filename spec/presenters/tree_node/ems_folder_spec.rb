describe TreeNode::EmsFolder do
  subject { described_class.new(object, nil, options) }
  let(:options) { {} }

  {
    :ems_folder           => 'f-',
    :storage_cluster      => 'dsc-',
    :inventory_group      => 'f-',
    :inventory_root_group => 'f-'
  }.each do |factory, prefix|
    klass = FactoryGirl.factory_by_name(factory).instance_variable_get(:@class_name)
    context(klass) do
      let(:object) { FactoryGirl.create(factory) }

      include_examples 'TreeNode::Node#key prefix', prefix
      include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close'
      include_examples 'TreeNode::Node#tooltip prefix', 'Folder'

      context 'type is vat' do
        let(:options) { {:type => :vat} }

        include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close-blue'
      end
    end
  end

  context 'Datacenter' do
    let(:object) { FactoryGirl.create(:datacenter) }

    include_examples 'TreeNode::Node#key prefix', 'dc-'
    include_examples 'TreeNode::Node#icon', 'fa fa-building-o'
    include_examples 'TreeNode::Node#tooltip prefix', 'Datacenter'
  end
end
