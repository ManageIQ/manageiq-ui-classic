describe ApplicationHelper::Button::GenericFeatureButtonWithDisable do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryGirl.create(:vm_vmware) }
  let(:feature) { :evacuate }
  let(:props) { {:options => {:feature => feature}} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, props) }

  it_behaves_like 'a generic feature button with disabled'
end
