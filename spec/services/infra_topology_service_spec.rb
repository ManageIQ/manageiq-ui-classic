describe InfraTopologyService do
  let(:infra_topology_service) { described_class.new(nil) }

  describe "#build_topology" do
    subject { infra_topology_service.build_topology }

    let(:ems) { FactoryBot.create(:ems_openstack_infra) }

    before do
      @cluster = FactoryBot.create(:ems_cluster_openstack, :ext_management_system => ems)
      @host = FactoryBot.create(:host_openstack_infra, :ems_cluster => @cluster, :ext_management_system => ems)
    end

    it "topology contains only the expected keys" do
      expect(subject.keys).to match_array(%i(items kinds filter_properties relations icons))
    end

    it "provider has unknown status when no authentication exists" do
      ems = FactoryBot.create(:ems_openstack_infra)

      allow(infra_topology_service).to receive(:retrieve_providers)
        .with(anything, ManageIQ::Providers::InfraManager)
        .and_return([ems])

      infra_topology_service.instance_variable_set(:@providers, ManageIQ::Providers::InfraManager
        .where(:id => ems.id))

      expect(subject[:items]).to eq(
        "InfraManager" + ems.id.to_s => {:name         => ems.name,
                                         :status       => "Unknown",
                                         :kind         => "InfraManager",
                                         :display_kind => "Openstack",
                                         :miq_id       => ems.id,
                                         :model        => ems.class.name,
                                         :key          => "InfraManager" + ems.id.to_s}
      )
    end

    it "topology contains the expected structure and content" do
      allow(infra_topology_service).to receive(:retrieve_providers).and_return([ems])
      infra_topology_service.instance_variable_set(:@entity, ems)

      expect(subject[:items]).to eq(
        "InfraManager" + ems.id.to_s    => {:name         => ems.name,
                                            :kind         => "InfraManager",
                                            :miq_id       => ems.id,
                                            :status       => "Unknown",
                                            :display_kind => "Openstack",
                                            :model        => ems.class.name,
                                            :key          => "InfraManager" + ems.id.to_s},
        "EmsCluster" + @cluster.id.to_s => {:name         => @cluster.name,
                                            :kind         => "EmsCluster",
                                            :miq_id       => @cluster.id,
                                            :status       => "Unknown",
                                            :display_kind => "EmsCluster",
                                            :provider     => ems.name,
                                            :model        => @cluster.class.name,
                                            :key          => "EmsCluster" + @cluster.id.to_s},
        "Host" + @host.id.to_s          => {:name         => @host.name,
                                            :kind         => "Host",
                                            :miq_id       => @host.id,
                                            :status       => "On",
                                            :display_kind => "Host",
                                            :provider     => ems.name,
                                            :model        => @host.class.name,
                                            :key          => "Host" + @host.id.to_s},
      )

      expect(subject[:relations].size).to eq(2)
      expect(subject[:relations]).to include(
        {:source => "InfraManager" + ems.id.to_s, :target => "EmsCluster" + @cluster.id.to_s},
        {:source => "EmsCluster" + @cluster.id.to_s, :target => "Host" + @host.id.to_s},
      )
    end
  end

  describe '#build_icons' do
    it "creates a hash of object types and their icon information" do
      FactoryBot.create(:ems_vmware)
      FactoryBot.create(:ems_openstack_infra)
      FactoryBot.create(:ems_openstack_infra)

      # entity_display_type is called once per class of ems
      expect(infra_topology_service).to receive(:entity_display_type).exactly(2).times.and_call_original

      icons = infra_topology_service.build_icons
      expect(icons["Openstack"][:type]).to eq("image")
      expect(icons["Openstack"][:icon]).to include("vendor-openstack_infra")
      expect(icons["Vmware"][:type]).to eq("image")
      expect(icons["Vmware"][:icon]).to include("vendor-vmwarews")
      expect(icons[:EmsCluster]).to eq(:type => "glyph", :class => "pficon pficon-cluster")
      expect(icons[:Host]).to       eq(:type => "glyph", :class => "pficon pficon-container-node")
    end
  end
end
