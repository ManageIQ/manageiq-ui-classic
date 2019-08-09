describe TreeNode::ServiceTemplateCatalog do
  subject { described_class.new(object, nil, nil) }
  let(:object) do
    tenant = FactoryBot.create(:tenant)
    FactoryBot.create(:service_template_catalog, :name => 'foo', :tenant => tenant)
  end

  include_examples 'TreeNode::Node#key prefix', 'stc-'
  include_examples 'TreeNode::Node#icon', 'pficon pficon-folder-close'

  describe '#title' do
    it 'returns with the catalog name and tenant name as a suffix' do
      expect(subject.text).to eq("#{object.name} (#{object.tenant.name})")
    end
  end
end
