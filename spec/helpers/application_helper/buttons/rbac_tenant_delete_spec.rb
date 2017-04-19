require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::RbacTenantDelete do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:tenant, :parent => tenant_parent) }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when record is a child tenant' do
      let(:tenant_parent) { FactoryGirl.create(:tenant) }
      it_behaves_like 'an enabled button'
    end
    context 'when record is the default tenant' do
      let(:tenant_parent) { nil }
      it_behaves_like 'a disabled button', 'Default Tenant can not be deleted'
    end
  end
end
