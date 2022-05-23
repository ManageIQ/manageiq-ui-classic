describe ApplicationHelper::Button::MiqActionEdit do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    subject { button[:title] }
    before { allow(record).to receive(:action_type).and_return(action_type) }
    before { allow(view_context).to receive(:x_node).and_return('node') }

    context 'and record has no policies' do
      let(:action_type) { "Non-default" }
      it_behaves_like 'an enabled button'
    end

    context 'and record has default action type' do
      let(:action_type) { "default" }
      it_behaves_like 'a disabled button',
                      'Default actions can not be changed.'
    end
  end
end
