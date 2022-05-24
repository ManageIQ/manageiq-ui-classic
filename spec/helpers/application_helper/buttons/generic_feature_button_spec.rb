describe ApplicationHelper::Button::GenericFeatureButton do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { Vm.new }
  let(:feature) { :create }
  let(:props) { {:options => {:feature => feature}} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, props) }

  include_examples 'a feature button'
end
