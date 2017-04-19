require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqActionEdit do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#disabled?' do
    before { allow(record).to receive(:action_type).and_return(action_type) }
    before { allow(view_context).to receive(:x_node).and_return('node') }
    before(:each) { subject.calculate_properties }

    context 'and record has no policies' do
      let(:action_type) { "Non-default" }
      it_behaves_like 'an enabled button'
    end

    context 'and record has default action type' do
      let(:action_type) { "default" }
      it_behaves_like 'a disabled button',
                      'Default actions can not be changed.'
    end
  end
end
