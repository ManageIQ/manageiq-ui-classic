shared_examples 'an analysis profile action button' do |action|
  describe '#disabled?' do
    let(:view_context) { setup_view_context_with_sandbox({}) }
    let(:record) { FactoryBot.create(:scan_item_set, :read_only => read_only) }
    let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

    context 'when Analysis Profile is read-only' do
      let(:read_only) { true }
      it_behaves_like 'a disabled button', "Sample Analysis Profile cannot be #{action}"
    end
    context 'when Analysis Profile is writable' do
      let(:read_only) { false }
      it_behaves_like 'an enabled button'
    end
  end
end
