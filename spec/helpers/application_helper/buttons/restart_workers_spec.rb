describe ApplicationHelper::Button::RestartWorkers do
  let(:sandbox) { {:selected_worker_id => worker_id} }
  let(:view_context) { setup_view_context_with_sandbox(sandbox) }
  let(:button) { described_class.new(view_context, {}, {'sb' => sandbox}, {}) }

  describe '#calculate_properties' do
    before { button.calculate_properties }
    context 'when worker is not selected' do
      let(:worker_id) { nil }
      it_behaves_like 'a disabled button', 'Select a worker to restart'
    end
    context 'when worker is selected' do
      let(:worker_id) { 'not_nil' }
      it_behaves_like 'an enabled button'
    end
  end
end
