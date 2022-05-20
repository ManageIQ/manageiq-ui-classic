describe ApplicationHelper::Button::RbacTenantDelete do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:tenant, :parent => tenant_parent) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    context 'when record is a child tenant' do
      let(:tenant_parent) { FactoryBot.create(:tenant) }
      it_behaves_like 'an enabled button'
    end
    context 'when record is the default tenant' do
      let(:tenant_parent) { nil }
      it_behaves_like 'a disabled button', 'Default Tenant can not be deleted'
    end
  end
end
