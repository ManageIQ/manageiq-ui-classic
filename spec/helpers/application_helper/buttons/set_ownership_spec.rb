require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::SetOwnership do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm, :ext_management_system => ext_management_system) }
  let(:ext_management_system) do
    FactoryGirl.create(:ext_management_system, :tenant_mapping_enabled => tenant_mapping_enabled)
  end

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when provider has tenant mapping enabled' do
      let(:tenant_mapping_enabled) { true }
      it_behaves_like 'a disabled button', 'Ownership is controlled by tenant mapping'
    end

    context 'when provider has tenant mapping disabled' do
      let(:tenant_mapping_enabled) { false }
      it_behaves_like 'an enabled button'
    end

    context 'when vm is not belong to any Vm' do
      let(:ext_management_system)  { nil }
      it_behaves_like 'an enabled button'
    end
  end
end
