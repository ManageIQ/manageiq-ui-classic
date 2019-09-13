describe CloudTopologyService do
  let(:cloud_topology_service) { described_class.new(nil) }

  describe "#build_topology" do
    subject { cloud_topology_service.build_topology }

    let(:ems) { FactoryBot.create(:ems_openstack) }

    before do
      @availability_zone = FactoryBot.create(:availability_zone_openstack, :ext_management_system => ems)
      @cloud_tenant = FactoryBot.create(:cloud_tenant_openstack, :ext_management_system => ems)
      @vm = FactoryBot.create(:vm_openstack, :cloud_tenant => @cloud_tenant, :ext_management_system => ems)
    end

    it "topology contains only the expected keys" do
      expect(subject.keys).to match_array(%i(items kinds filter_properties relations icons))
    end

    it "provider has unknown status when no authentication exists" do
      ems = FactoryBot.create(:ems_openstack)

      allow(cloud_topology_service)
        .to receive(:retrieve_providers)
        .with(anything, ManageIQ::Providers::CloudManager)
        .and_return([ems])

      cloud_topology_service
        .instance_variable_set(:@providers, ManageIQ::Providers::CloudManager.where(:id => ems.id))

      expect(subject[:items]).to eq(
        "CloudManager" + ems.id.to_s => {:name         => ems.name,
                                         :status       => "Unknown",
                                         :kind         => "CloudManager",
                                         :display_kind => "Openstack",
                                         :miq_id       => ems.id,
                                         :model        => ems.class.name,
                                         :key          => "CloudManager" + ems.id.to_s}
      )
    end

    it "topology contains the expected structure and content" do
      allow(cloud_topology_service).to receive(:retrieve_providers).and_return([ems])
      cloud_topology_service.instance_variable_set(:@entity, ems)

      expect(subject[:items]).to eq(
        "CloudManager" + ems.id.to_s                    => {:name         => ems.name,
                                                            :kind         => "CloudManager",
                                                            :miq_id       => ems.id,
                                                            :status       => "Unknown",
                                                            :display_kind => "Openstack",
                                                            :model        => ems.class.name,
                                                            :key          => "CloudManager" + ems.id.to_s},
        "AvailabilityZone" + @availability_zone.id.to_s => {:name         => @availability_zone.name,
                                                            :kind         => "AvailabilityZone",
                                                            :miq_id       => @availability_zone.id,
                                                            :status       => "OK",
                                                            :display_kind => "AvailabilityZone",
                                                            :provider     => ems.name,
                                                            :model        => @availability_zone.class.name,
                                                            :key          => "AvailabilityZone" + @availability_zone.id.to_s},
        "CloudTenant" + @cloud_tenant.id.to_s           => {:name         => @cloud_tenant.name,
                                                            :kind         => "CloudTenant",
                                                            :miq_id       => @cloud_tenant.id,
                                                            :status       => "Unknown",
                                                            :display_kind => "CloudTenant",
                                                            :provider     => ems.name,
                                                            :model        => @cloud_tenant.class.name,
                                                            :key          => "CloudTenant" + @cloud_tenant.id.to_s},
        "Vm" + @vm.id.to_s                              => {:name         => @vm.name,
                                                            :kind         => "Vm",
                                                            :miq_id       => @vm.id,
                                                            :status       => "On",
                                                            :display_kind => "VM",
                                                            :provider     => ems.name,
                                                            :model        => @vm.class.name,
                                                            :key          => "Vm" + @vm.id.to_s},
      )

      expect(subject[:relations].size).to eq(3)
      expect(subject[:relations]).to include(
        {:source => "CloudManager" + ems.id.to_s, :target => "AvailabilityZone" + @availability_zone.id.to_s},
        {:source => "CloudManager" + ems.id.to_s, :target => "CloudTenant" + @cloud_tenant.id.to_s},
        {:source => "CloudTenant" + @cloud_tenant.id.to_s, :target => "Vm" + @vm.id.to_s},
      )
    end

    it "topology contains the expected structure when vm is off" do
      # vm and host test cross provider correlation to infra provider
      @vm.update(:raw_power_state => "SHUTOFF")
      allow(cloud_topology_service).to receive(:retrieve_providers).and_return([ems])
      cloud_topology_service.instance_variable_set(:@entity, ems)

      expect(subject[:items]).to eq(
        "CloudManager" + ems.id.to_s                    => {:name         => ems.name,
                                                            :kind         => "CloudManager",
                                                            :miq_id       => ems.id,
                                                            :status       => "Unknown",
                                                            :display_kind => "Openstack",
                                                            :model        => ems.class.name,
                                                            :key          => "CloudManager" + ems.id.to_s},
        "AvailabilityZone" + @availability_zone.id.to_s => {:name         => @availability_zone.name,
                                                            :kind         => "AvailabilityZone",
                                                            :miq_id       => @availability_zone.id,
                                                            :status       => "OK",
                                                            :display_kind => "AvailabilityZone",
                                                            :provider     => ems.name,
                                                            :model        => @availability_zone.class.name,
                                                            :key          => "AvailabilityZone" + @availability_zone.id.to_s},
        "CloudTenant" + @cloud_tenant.id.to_s           => {:name         => @cloud_tenant.name,
                                                            :kind         => "CloudTenant",
                                                            :miq_id       => @cloud_tenant.id,
                                                            :status       => "Unknown",
                                                            :display_kind => "CloudTenant",
                                                            :provider     => ems.name,
                                                            :model        => @cloud_tenant.class.name,
                                                            :key          => "CloudTenant" + @cloud_tenant.id.to_s},
        "Vm" + @vm.id.to_s                              => {:name         => @vm.name,
                                                            :kind         => "Vm",
                                                            :miq_id       => @vm.id,
                                                            :status       => "Off",
                                                            :display_kind => "VM",
                                                            :provider     => ems.name,
                                                            :model        => @vm.class.name,
                                                            :key          => "Vm" + @vm.id.to_s},
      )

      expect(subject[:relations].size).to eq(3)
      expect(subject[:relations]).to include(
        {:source => "CloudManager" + ems.id.to_s, :target => "AvailabilityZone" + @availability_zone.id.to_s},
        {:source => "CloudManager" + ems.id.to_s, :target => "CloudTenant" + @cloud_tenant.id.to_s},
        {:source => "CloudTenant" + @cloud_tenant.id.to_s, :target => "Vm" + @vm.id.to_s},
      )
    end
  end
end
