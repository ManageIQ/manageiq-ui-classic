describe ApplicationHelper::Button::VmTimeline do
  let(:record) { FactoryBot.create(:vm) }
  let(:button) { described_class.new(setup_view_context_with_sandbox({}), {}, {'record' => record}, {}) }

  it_behaves_like 'a timeline button', :entity => 'VM'
end
