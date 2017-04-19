require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::CockpitConsole do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {:record => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#disabled?' do
    context "when the power state of the record is 'on'" do
      let(:power_state) { 'on' }
      it 'returns false' do
        expect(subject[:disabled?]).to be_falsey
      end
    end
    context "when the power state of the record is not 'on'" do
      let(:power_state) { 'unknown' } # orphaned and archived VM's
      it 'returns true' do
        expect(subject[:disabled?]).to be_nil
      end
    end
  end
end
