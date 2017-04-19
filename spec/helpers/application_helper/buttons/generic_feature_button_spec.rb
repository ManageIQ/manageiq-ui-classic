require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::GenericFeatureButton do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:options => {:feature => feature}} }
  let(:record) { double }
  let(:feature) { :some_feature }

  it_behaves_like 'a generic feature button'
end
