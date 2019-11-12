describe NetworkPortHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i(name mac_address type device_owner floating_ip_addresses fixed_ip_addresses)

  include_examples "textual_group", "Relationships", %i(
    parent_ems_cloud
    ems_network
    cloud_tenant
    device
    cloud_subnets
    floating_ips
    security_groups
    host
  )

  describe '#textual_host' do
    let(:host) { FactoryBot.create(:host) }
    let(:port) { FactoryBot.create(:network_port, :device_type => 'Host', :device => host) }

    before do
      instance_variable_set(:@record, port)
      allow(self).to receive(:url_for_only_path).and_return("/host/show/#{host.id}")
    end

    it 'returns Host of selected Network Port' do
      expect(textual_host[:icon]).to eq('pficon pficon-container-node')
      expect(textual_host[:value]).to eq(host.name)
      expect(textual_host[:link]).to eq("/host/show/#{host.id}")
    end
  end
end
