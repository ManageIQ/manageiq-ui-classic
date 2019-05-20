describe ApplicationHelper::Button::RbacUserDelete do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#calculate_properties' do
    before { button.calculate_properties }

    context 'when user is the root administrator' do
      let(:record) { User.find_by(:userid => 'admin') }
      it_behaves_like 'a disabled button', 'Default Administrator can not be deleted'
    end
    context 'when user is a common administrator' do
      let(:record) { FactoryBot.create(:user) }
      it_behaves_like 'an enabled button'
    end
  end
end
