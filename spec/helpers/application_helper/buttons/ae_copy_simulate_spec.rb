describe ApplicationHelper::Button::AeCopySimulate do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:resolve) { {:button_class => button_class} }
  let(:button) { described_class.new(view_context, {}, {'resolve' => resolve}, {}) }

  describe '#disabled?' do
    context 'when object attribute is specified' do
      let(:button_class) { 'some_button_class' }
      it_behaves_like 'an enabled button'
    end
    context 'when object attribute is not specified' do
      let(:button_class) { nil }
      it_behaves_like 'a disabled button',
                      'Object attribute must be specified to copy object details for use in a Button'
    end
  end
end
