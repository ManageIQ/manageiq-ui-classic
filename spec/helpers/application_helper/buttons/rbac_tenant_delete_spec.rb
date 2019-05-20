describe ApplicationHelper::Button::RbacTenantDelete do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#calculate_properties' do
    before { button.calculate_properties }

    context 'when record is a child tenant' do
      let(:record) { FactoryBot.create(:tenant, :parent => FactoryBot.create(:tenant)) }
      it_behaves_like 'an enabled button'
    end
    context 'when record is the default tenant' do
      let(:record) { Tenant.default_tenant }
      it_behaves_like 'a disabled button', 'Default Tenant can not be deleted'
    end
  end
end
