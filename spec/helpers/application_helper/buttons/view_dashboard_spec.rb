require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::ViewDashboard do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'showtype' => showtype} }
  let(:props) { Hash.new }

  describe '#calculate_properties' do
    before { subject.calculate_properties }
    context 'when showtype == dashboard' do
      let(:showtype) { 'dashboard' }
      it_behaves_like 'a disabled button'
    end
    context 'when showtype != dashboard' do
      let(:showtype) { 'not_dashboard' }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
  end
end
