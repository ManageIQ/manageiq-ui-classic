describe NetworkTopologyService do
  let(:network_topology_service) { described_class.new(nil) }

  describe "#build_topology" do
    subject { network_topology_service.build_topology }

    let(:ems_cloud) { FactoryBot.create(:ems_openstack) }
    let(:ems) { ems_cloud.network_manager }

    before do
      @cloud_tenant = FactoryBot.create(:cloud_tenant_openstack)
      @availability_zone = FactoryBot.create(:availability_zone_openstack,
                                              :name                  => "AZ name",
                                              :ext_management_system => ems_cloud)
      @vm = FactoryBot.create(:vm_openstack,
                               :cloud_tenant          => @cloud_tenant,
                               :ext_management_system => ems_cloud,
                               :availability_zone     => @availability_zone)
      @cloud_network = FactoryBot.create(:cloud_network_openstack)
      @public_network = FactoryBot.create(:cloud_network_openstack)
      @cloud_subnet = FactoryBot.create(:cloud_subnet_openstack, :cloud_network         => @cloud_network,
                                                                  :ext_management_system => ems)
      @network_router = FactoryBot.create(:network_router_openstack, :cloud_subnets => [@cloud_subnet],
                                                                      :cloud_network => @public_network)
      @floating_ip = FactoryBot.create(:floating_ip_openstack, :vm => @vm, :cloud_network => @public_network)
      @security_group = FactoryBot.create(:security_group_openstack)
      @network_port = FactoryBot.create(:network_port_openstack, :device          => @vm,
                                                                  :security_groups => [@security_group],
                                                                  :floating_ip     => @floating_ip)
      @cloud_subnet_network_port = FactoryBot.create(:cloud_subnet_network_port, :cloud_subnet => @cloud_subnet,
                                                                                  :network_port => @network_port)
    end

    it "topology contains only the expected keys" do
      expect(subject.keys).to match_array(%i(items kinds filter_properties relations icons))
    end

    it "provider has unknown status when no authentication exists" do
      ems = FactoryBot.create(:ems_openstack).network_manager

      allow(network_topology_service).to receive(:retrieve_providers).with(
        anything, ManageIQ::Providers::NetworkManager
      ).and_return([ems])
      network_topology_service.instance_variable_set(:@providers,
                                                     ManageIQ::Providers::NetworkManager.where(:id => ems.id))

      expect(subject[:items]).to eq(
        "NetworkManager" + ems.id.to_s => {:name         => ems.name,
                                           :status       => "Unknown",
                                           :kind         => "NetworkManager",
                                           :display_kind => "Openstack",
                                           :miq_id       => ems.id,
                                           :model        => ems.class.name,
                                           :key          => "NetworkManager" + ems.id.to_s}
      )
    end

    it "topology contains the expected structure and content" do
      allow(network_topology_service).to receive(:retrieve_providers).and_return([ems])
      network_topology_service.instance_variable_set(:@entity, ems)

      expect(subject[:items]).to(
        eq(
          "NetworkManager" + ems.id.to_s                  => {
            :name         => ems.name,
            :kind         => "NetworkManager",
            :miq_id       => ems.id,
            :status       => "Unknown",
            :display_kind => "Openstack",
            :model        => ems.class.name,
            :key          => "NetworkManager" + ems.id.to_s
          },
          "AvailabilityZone" + @availability_zone.id.to_s => {
            :name         => "AZ name",
            :kind         => "AvailabilityZone",
            :miq_id       => @availability_zone.id,
            :status       => "Unknown",
            :display_kind => "AvailabilityZone",
            :model        => @availability_zone.class.name,
            :key          => "AvailabilityZone" + @availability_zone.id.to_s
          },
          "CloudTenant" + @cloud_tenant.id.to_s           => {
            :name         => @cloud_tenant.name,
            :kind         => "CloudTenant",
            :miq_id       => @cloud_tenant.id,
            :status       => "Unknown",
            :display_kind => "CloudTenant",
            :model        => @cloud_tenant.class.name,
            :key          => "CloudTenant" + @cloud_tenant.id.to_s
          },
          "CloudNetwork" + @cloud_network.id.to_s         => {
            :name         => @cloud_network.name,
            :kind         => "CloudNetwork",
            :miq_id       => @cloud_network.id,
            :status       => "Unknown",
            :display_kind => "CloudNetwork",
            :model        => @cloud_network.class.name,
            :key          => "CloudNetwork" + @cloud_network.id.to_s
          },
          "CloudNetwork" + @public_network.id.to_s        => {
            :name         => @public_network.name,
            :kind         => "CloudNetwork",
            :miq_id       => @public_network.id,
            :status       => "Unknown",
            :display_kind => "CloudNetwork",
            :model        => @public_network.class.name,
            :key          => "CloudNetwork" + @public_network.id.to_s
          },
          "CloudSubnet" + @cloud_subnet.id.to_s           => {
            :name         => @cloud_subnet.name,
            :kind         => "CloudSubnet",
            :miq_id       => @cloud_subnet.id,
            :status       => "Unknown",
            :display_kind => "CloudSubnet",
            :model        => @cloud_subnet.class.name,
            :key          => "CloudSubnet" + @cloud_subnet.id.to_s
          },
          "FloatingIp" + @floating_ip.id.to_s             => {
            :name         => @floating_ip.name,
            :kind         => "FloatingIp",
            :miq_id       => @floating_ip.id,
            :status       => "Unknown",
            :display_kind => "FloatingIp",
            :model        => @floating_ip.class.name,
            :key          => "FloatingIp" + @floating_ip.id.to_s
          },
          "NetworkRouter" + @network_router.id.to_s       => {
            :name         => @network_router.name,
            :kind         => "NetworkRouter",
            :miq_id       => @network_router.id,
            :status       => "Unknown",
            :display_kind => "NetworkRouter",
            :model        => @network_router.class.name,
            :key          => "NetworkRouter" + @network_router.id.to_s
          },
          "SecurityGroup" + @security_group.id.to_s       => {
            :name         => @security_group.name,
            :kind         => "SecurityGroup",
            :miq_id       => @security_group.id,
            :status       => "Unknown",
            :display_kind => "SecurityGroup",
            :model        => @security_group.class.name,
            :key          => "SecurityGroup" + @security_group.id.to_s
          },
          "Vm" + @vm.id.to_s                              => {
            :name         => @vm.name,
            :kind         => "Vm",
            :miq_id       => @vm.id,
            :status       => "On",
            :display_kind => "VM",
            :provider     => ems_cloud.name,
            :model        => @vm.class.name,
            :key          => "Vm" + @vm.id.to_s
          },
        )
      )

      expect(subject[:relations].size).to eq(11)
      expect(subject[:relations]).to include(
        {:source => "NetworkManager" + ems.id.to_s, :target => "CloudSubnet" + @cloud_subnet.id.to_s},
        {:source => "NetworkManager" + ems.id.to_s, :target => "CloudSubnet" + @cloud_subnet.id.to_s},
        {:source => "AvailabilityZone" + @availability_zone.id.to_s, :target => "Vm" + @vm.id.to_s},
        {:source => "CloudSubnet" + @cloud_subnet.id.to_s, :target => "CloudNetwork" + @cloud_network.id.to_s},
        {:source => "CloudSubnet" + @cloud_subnet.id.to_s, :target => "Vm" + @vm.id.to_s},
        {:source => "Vm" + @vm.id.to_s, :target => "FloatingIp" + @floating_ip.id.to_s},
        {:source => "Vm" + @vm.id.to_s, :target => "CloudTenant" + @cloud_tenant.id.to_s},
        {:source => "Vm" + @vm.id.to_s, :target => "SecurityGroup" + @security_group.id.to_s},
        {:source => "CloudSubnet" + @cloud_subnet.id.to_s, :target => "NetworkRouter" + @network_router.id.to_s},
        {:source => "NetworkRouter" + @network_router.id.to_s, :target => "CloudNetwork" + @public_network.id.to_s},
        {:source => "CloudNetwork" + @public_network.id.to_s, :target => "FloatingIp" + @floating_ip.id.to_s},
      )
    end

    it "topology contains the expected structure when vm is off" do
      # vm and host test cross provider correlation to infra provider
      @vm.update(:raw_power_state => "SHUTOFF")
      allow(network_topology_service).to receive(:retrieve_providers).and_return([ems])
      network_topology_service.instance_variable_set(:@entity, ems)

      expect(subject[:items]).to(
        eq(
          "NetworkManager" + ems.id.to_s                  => {
            :name         => ems.name,
            :kind         => "NetworkManager",
            :miq_id       => ems.id,
            :status       => "Unknown",
            :display_kind => "Openstack",
            :model        => ems.class.name,
            :key          => "NetworkManager" + ems.id.to_s
          },
          "AvailabilityZone" + @availability_zone.id.to_s => {
            :name         => "AZ name",
            :kind         => "AvailabilityZone",
            :miq_id       => @availability_zone.id,
            :status       => "Unknown",
            :display_kind => "AvailabilityZone",
            :model        => @availability_zone.class.name,
            :key          => "AvailabilityZone" + @availability_zone.id.to_s
          },
          "CloudTenant" + @cloud_tenant.id.to_s           => {
            :name         => @cloud_tenant.name,
            :kind         => "CloudTenant",
            :miq_id       => @cloud_tenant.id,
            :status       => "Unknown",
            :display_kind => "CloudTenant",
            :model        => @cloud_tenant.class.name,
            :key          => "CloudTenant" + @cloud_tenant.id.to_s
          },
          "CloudNetwork" + @cloud_network.id.to_s         => {
            :name         => @cloud_network.name,
            :kind         => "CloudNetwork",
            :miq_id       => @cloud_network.id,
            :status       => "Unknown",
            :display_kind => "CloudNetwork",
            :model        => @cloud_network.class.name,
            :key          => "CloudNetwork" + @cloud_network.id.to_s
          },
          "CloudNetwork" + @public_network.id.to_s        => {
            :name         => @public_network.name,
            :kind         => "CloudNetwork",
            :miq_id       => @public_network.id,
            :status       => "Unknown",
            :display_kind => "CloudNetwork",
            :model        => @public_network.class.name,
            :key          => "CloudNetwork" + @public_network.id.to_s
          },
          "CloudSubnet" + @cloud_subnet.id.to_s           => {
            :name         => @cloud_subnet.name,
            :kind         => "CloudSubnet",
            :miq_id       => @cloud_subnet.id,
            :status       => "Unknown",
            :display_kind => "CloudSubnet",
            :model        => @cloud_subnet.class.name,
            :key          => "CloudSubnet" + @cloud_subnet.id.to_s
          },
          "FloatingIp" + @floating_ip.id.to_s             => {
            :name         => @floating_ip.name,
            :kind         => "FloatingIp",
            :miq_id       => @floating_ip.id,
            :status       => "Unknown",
            :display_kind => "FloatingIp",
            :model        => @floating_ip.class.name,
            :key          => "FloatingIp" + @floating_ip.id.to_s
          },
          "NetworkRouter" + @network_router.id.to_s       => {
            :name         => @network_router.name,
            :kind         => "NetworkRouter",
            :miq_id       => @network_router.id,
            :status       => "Unknown",
            :display_kind => "NetworkRouter",
            :model        => @network_router.class.name,
            :key          => "NetworkRouter" + @network_router.id.to_s
          },
          "SecurityGroup" + @security_group.id.to_s       => {
            :name         => @security_group.name,
            :kind         => "SecurityGroup",
            :miq_id       => @security_group.id,
            :status       => "Unknown",
            :display_kind => "SecurityGroup",
            :model        => @security_group.class.name,
            :key          => "SecurityGroup" + @security_group.id.to_s
          },
          "Vm" + @vm.id.to_s                              => {
            :name         => @vm.name,
            :kind         => "Vm",
            :miq_id       => @vm.id,
            :status       => "Off",
            :display_kind => "VM",
            :provider     => ems_cloud.name,
            :model        => @vm.class.name,
            :key          => "Vm" + @vm.id.to_s
          },
        )
      )

      expect(subject[:relations].size).to eq(11)
      expect(subject[:relations]).to include(
        {:source => "NetworkManager" + ems.id.to_s, :target => "AvailabilityZone" + @availability_zone.id.to_s},
        {:source => "NetworkManager" + ems.id.to_s, :target => "CloudSubnet" + @cloud_subnet.id.to_s},
        {:source => "AvailabilityZone" + @availability_zone.id.to_s, :target => "Vm" + @vm.id.to_s},
        {:source => "CloudSubnet" + @cloud_subnet.id.to_s, :target => "CloudNetwork" + @cloud_network.id.to_s},
        {:source => "CloudSubnet" + @cloud_subnet.id.to_s, :target => "Vm" + @vm.id.to_s},
        {:source => "Vm" + @vm.id.to_s, :target => "FloatingIp" + @floating_ip.id.to_s},
        {:source => "Vm" + @vm.id.to_s, :target => "CloudTenant" + @cloud_tenant.id.to_s},
        {:source => "Vm" + @vm.id.to_s, :target => "SecurityGroup" + @security_group.id.to_s},
        {:source => "CloudSubnet" + @cloud_subnet.id.to_s, :target => "NetworkRouter" + @network_router.id.to_s},
        {:source => "NetworkRouter" + @network_router.id.to_s, :target => "CloudNetwork" + @public_network.id.to_s},
        {:source => "CloudNetwork" + @public_network.id.to_s, :target => "FloatingIp" + @floating_ip.id.to_s},
      )
    end
  end
end
