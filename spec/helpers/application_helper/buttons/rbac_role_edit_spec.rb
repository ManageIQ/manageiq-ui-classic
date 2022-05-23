describe ApplicationHelper::Button::RbacRoleEdit do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    let(:record) { FactoryBot.create(:miq_user_role, :read_only => read_only) }
    context 'when role is writable' do
      let(:read_only) { false }
      it_behaves_like 'an enabled button'
    end
    context 'when role is read-only' do
      let(:read_only) { true }
      it_behaves_like 'a disabled button', 'This Role is Read Only and can not be edited'
    end
  end
end
