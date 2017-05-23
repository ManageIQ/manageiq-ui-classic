require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::HostMiqRequestNew do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#disabled?' do
    before { allow(record).to receive(:mac_address).and_return(mac_address) }
    before { allow(PxeServer).to receive(:all).and_return(serverAll) }
    before(:each) { subject.calculate_properties }

    context 'and record has mac address and servers' do
      let(:mac_address) { "00:0D:93:13:51:1A" }
      let(:serverAll) { ['FancyServer'] }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end

    context 'and record has no mac address' do
      let(:mac_address) { false }
      let(:serverAll) { ['FancyServer'] }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'This Host can not be provisioned because the MAC address is not known'
    end

    context 'and record has mac address but no servers' do
      let(:mac_address) { "00:0D:93:13:51:1A" }
      let(:serverAll) { [] }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'No PXE Servers are available for Host provisioning'
    end
  end
end
