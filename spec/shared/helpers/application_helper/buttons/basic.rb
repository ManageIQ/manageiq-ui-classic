shared_context 'ApplicationHelper::Button::Basic' do
  let(:view_context) { setup_view_context_with_sandbox(sandbox) }
  let(:button) { described_class.new(view_context, {}, instance_data, props) }
  subject { button }
end
