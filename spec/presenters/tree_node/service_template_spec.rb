require 'shared/presenters/tree_node/common'

describe TreeNode::ServiceTemplate do
  subject { described_class.new(object, nil, {}) }
  let(:tenant) { FactoryGirl.create(:tenant) }
  %i(
    service_template
    service_template_ansible_tower
    service_template_orchestration
  ).each do |factory|
    context(factory.to_s.camelize) do
      let(:object) { FactoryGirl.create(factory, :name => 'foo', :tenant => tenant, :service_type => stype) }
      let(:stype) { 'atomic' }

      include_examples 'TreeNode::Node#key prefix', 'st-'
      include_examples 'TreeNode::Node#icon', 'fa fa-cube'

      unless factory == :service_template_ansible_tower
        context 'catalog bundle' do
          let(:stype) { 'composite' }

          include_examples 'TreeNode::Node#icon', 'fa fa-cubes'
        end
      end

      describe '#title' do
        it 'returns with the catalog name and tenant name as a suffix' do
          expect(subject.title).to eq("#{object.name} (#{object.tenant.name})")
        end
      end
    end
  end
end
