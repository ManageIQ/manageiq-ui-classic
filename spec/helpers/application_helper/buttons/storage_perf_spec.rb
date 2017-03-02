describe ApplicationHelper::Button::StoragePerf do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryGirl.create(:storage) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  it_behaves_like 'a performance button', 'Datastore'
end
