describe ApplicationHelper::Button::GenericFeatureButton do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { Vm.new }
  let(:feature) { :some_feature }
  let(:props) { {:options => {:feature => feature}} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, props) }

  it_behaves_like 'a generic feature button'
end
