require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::ViewSummary do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'showtype' => showtype} }
  let(:props) { Hash.new }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when showtype == dashboard' do
      let(:showtype) { 'dashboard' }
      it_behaves_like 'an enabled button'
    end
    context 'when showtype != dashboard' do
      let(:showtype) { 'not_dashboard' }
      it_behaves_like 'a disabled button'
    end
  end
end
