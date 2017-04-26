describe InfraTopologyService do
  let(:infra_topology_service) { described_class.new(nil) }

  describe "#build_topology" do
    subject { infra_topology_service.build_topology }

    let(:ems) { FactoryGirl.create(:ems_openstack_infra) }

    before :each do
      @cluster = FactoryGirl.create(:ems_cluster_openstack, :ext_management_system => ems)
      @host = FactoryGirl.create(:host_openstack_infra, :ems_cluster => @cluster, :ext_management_system => ems)
    end

    it "topology contains only the expected keys" do
      expect(subject.keys).to match_array([:items, :kinds, :relations, :icons])
    end

    it "provider has unknown status when no authentication exists" do
      ems = FactoryGirl.create(:ems_openstack_infra)

      allow(infra_topology_service).to receive(:retrieve_providers)
        .with(anything, ManageIQ::Providers::InfraManager)
        .and_return([ems])

      infra_topology_service.instance_variable_set(:@providers, ManageIQ::Providers::InfraManager
        .where(:id => ems.id))

      expect(subject[:items]).to eq(
        "InfraManager" + ems.compressed_id.to_s   => {:name         => ems.name,
                                                      :status       => "Unknown",
                                                      :kind         => "InfraManager",
                                                      :display_kind => "Openstack",
                                                      :miq_id       => ems.id})
    end

    it "topology contains the expected structure and content" do
      allow(infra_topology_service).to receive(:retrieve_providers).and_return([ems])
      infra_topology_service.instance_variable_set(:@entity, ems)

      expect(subject[:items]).to eq(
        "InfraManager" + ems.compressed_id.to_s             =>  {:name         => ems.name,
                                                                 :kind         => "InfraManager",
                                                                 :miq_id       => ems.id,
                                                                 :status       => "Unknown",
                                                                 :display_kind => "Openstack"},
        "EmsCluster" + @cluster.compressed_id.to_s          =>  {:name         => @cluster.name,
                                                                 :kind         => "EmsCluster",
                                                                 :miq_id       => @cluster.id,
                                                                 :status       => "Unknown",
                                                                 :display_kind => "EmsCluster",
                                                                 :provider     => ems.name},
        "Host" + @host.compressed_id.to_s                   =>  {:name         => @host.name,
                                                                 :kind         => "Host",
                                                                 :miq_id       => @host.id,
                                                                 :status       => "On",
                                                                 :display_kind => "Host",
                                                                 :provider     => ems.name},
      )

      expect(subject[:relations].size).to eq(2)
      expect(subject[:relations]).to include(
        {:source => "InfraManager" + ems.compressed_id.to_s, :target => "EmsCluster" + @cluster.compressed_id.to_s},
        {:source => "EmsCluster" + @cluster.compressed_id.to_s, :target => "Host" + @host.compressed_id.to_s},)
    end
  end
end
