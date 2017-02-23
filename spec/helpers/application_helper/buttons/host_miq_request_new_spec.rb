describe ApplicationHelper::Button::HostMiqRequestNew do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryGirl.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    subject { button[:title] }
    before { allow(record).to receive(:mac_address).and_return(mac_address) }
    before { allow(PxeServer).to receive(:all).and_return(serverAll) }
    before(:each) { button.calculate_properties }

    context 'and record has mac address and servers' do
      let(:mac_address) { "00:0D:93:13:51:1A" }
      let(:serverAll) { ['FancyServer'] }
      it_behaves_like 'an enabled button'
    end

    context 'and record has no mac address' do
      let(:mac_address) { false }
      let(:serverAll) { ['FancyServer'] }
      it_behaves_like 'a disabled button',
                      'This Host can not be provisioned because the MAC address is not known'
    end

    context 'and record has mac address but no servers' do
      let(:mac_address) { "00:0D:93:13:51:1A" }
      let(:serverAll) { [] }
      it_behaves_like 'a disabled button',
                      'No PXE Servers are available for Host provisioning'
    end
  end
end
