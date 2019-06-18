describe ApplicationHelper::Button::EmsStorageTimeline do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:ext_management_system) }
  let(:props) { {:options => {:feature => :timeline}} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, props) }

  it_behaves_like 'a timeline button', :entity => 'Storage Manager'
end
