describe ApplicationHelper::Button::RbacUserCopy do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    context 'when user is an administrator' do
      let(:record) { FactoryBot.create(:user_admin) }
      it_behaves_like 'a disabled button', 'Super Administrator can not be copied'
    end
    context 'when user is not an administrator' do
      let(:record) { FactoryBot.create(:user) }
      it_behaves_like 'an enabled button'
    end
  end
end
