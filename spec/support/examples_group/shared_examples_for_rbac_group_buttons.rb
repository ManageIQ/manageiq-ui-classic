shared_examples 'an rbac_group_action button' do |action|
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    context 'record is read-only' do
      let(:record) { FactoryBot.create(:miq_group, :system_type) }
      it_behaves_like 'a disabled button', "This Group is Read Only and can not be #{action}"
    end
    context 'record is writable' do
      let(:record) { FactoryBot.create(:miq_group) }
      it_behaves_like 'an enabled button'
    end
  end
end
