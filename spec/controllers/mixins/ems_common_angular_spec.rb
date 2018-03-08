describe Mixins::EmsCommonAngular do
  context '.retrieve_event_stream_selection' do
    let(:network_controller) { EmsNetworkController.new }
    let(:ems_nuage) { FactoryGirl.create(:ems_nuage_network_with_authentication) }
    let(:ems_openstack) { FactoryGirl.create(:ems_openstack_with_authentication) }

    it 'when amqp' do
      # remove default endpoints
      ems_nuage.endpoints = []
      ems_nuage.endpoints << Endpoint.create(:role => 'amqp', :hostname => 'hostname')
      network_controller.instance_variable_set(:@ems, ems_nuage)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('amqp')
    end

    it 'when ceilometer' do
      ems_openstack.endpoints << Endpoint.create(:role => 'ceilometer', :hostname => 'hostname')
      network_controller.instance_variable_set(:@ems, ems_openstack)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('ceilometer')
    end

    it 'when ceilometer and amqp has empty hostname' do
      # remove default endpoints
      ems_nuage.endpoints = []
      ems_nuage.endpoints << Endpoint.create(:role => 'ceilometer', :hostname => 'hostname')
      ems_nuage.endpoints << Endpoint.create(:role => 'amqp')
      network_controller.instance_variable_set(:@ems, ems_nuage)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('ceilometer')
    end

    it 'when amqp and ceilometer has empty hostname' do
      # remove default endpoints
      ems_nuage.endpoints = []
      ems_nuage.endpoints << Endpoint.create(:role => 'ceilometer')
      ems_nuage.endpoints << Endpoint.create(:role => 'amqp', :hostname => 'hostname')
      network_controller.instance_variable_set(:@ems, ems_nuage)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('amqp')
    end

    it 'none when amqp and ceilometer have empty hostnames' do
      # remove default endpoints
      ems_nuage.endpoints = []
      ems_nuage.endpoints << Endpoint.create(:role => 'ceilometer')
      ems_nuage.endpoints << Endpoint.create(:role => 'amqp')
      network_controller.instance_variable_set(:@ems, ems_nuage)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('none')
    end

    it 'ceilometer when openstack provider when amqp and ceilometer have nil endpoints' do
      network_controller.instance_variable_set(:@ems, ems_openstack)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('ceilometer')
    end

    it 'when none' do
      # remove default endpoints
      ems_nuage.endpoints = []
      network_controller.instance_variable_set(:@ems, ems_nuage)

      expect(network_controller.send(:retrieve_event_stream_selection)).to eq('none')
    end
  end
end
