require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::GenericFeatureButtonWithDisable do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:options => {:feature => feature}} }
  let(:record) { FactoryGirl.create(:vm_vmware) }
  let(:feature) { :evacuate }

  it_behaves_like 'a generic feature button with disabled'
end
