describe ApplicationHelper::Button::ServiceRetireNow do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:service, :retired => retired) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    context 'when Service is retired' do
      let(:retired) { true }
      it_behaves_like 'a disabled button', 'Service is already retired'
    end
    context 'when Service is not retired' do
      let(:retired) { false }
      it_behaves_like 'an enabled button'
    end
  end
end
