require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::VmPerf do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm_or_template) }

  it_behaves_like 'a performance button', 'VM'
end
