describe ApplicationHelper::Button::SmartStateScan do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {}, {}) }

  it_behaves_like 'a smart state scan button'
end
