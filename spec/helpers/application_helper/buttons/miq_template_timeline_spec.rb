describe ApplicationHelper::Button::MiqTemplateTimeline do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:template_redhat) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  it_behaves_like 'a timeline button', :entity => 'Template'
end
