describe ApplicationHelper::Button::RbacRoleDelete do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:read_only) { false }
  let(:record) { FactoryBot.create(:miq_user_role, :read_only => read_only) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    context 'when role is writable' do
      context 'when role is not in use by any Group' do
        it_behaves_like 'an enabled button'
      end
      context 'when role is in use by one or more Groups' do
        before { FactoryBot.create(:miq_group, :miq_user_role => record) }
        it_behaves_like 'a disabled button', 'This Role is in use by one or more Groups and can not be deleted'
      end
    end
    context 'when role is read-only' do
      let(:read_only) { true }
      it_behaves_like 'a disabled button', 'This Role is Read Only and can not be deleted'
    end
  end
end
