describe ContainerTopologyService do
  let(:container_topology_service) { described_class.new(nil) }

  describe "#build_topology" do
    subject { container_topology_service.build_topology }

    it "topology contains only the expected keys" do
      expect(subject.keys).to match_array(%i(items kinds filter_properties relations icons))
    end

    let(:container) { Container.create(:name => "ruby-example", :state => 'running') }
    let(:container_condition) { ContainerCondition.create(:name => 'Ready', :status => 'True') }
    let(:container_node) { ContainerNode.create(:ext_management_system => ems_kube, :name => "127.0.0.1", :ems_ref => "905c90ba-3e00-11e5-a0d2-18037327aaeb", :container_conditions => [container_condition], :lives_on => vm_rhev) }
    let(:ems_kube) { FactoryBot.create(:ems_kubernetes_with_authentication_err) }
    let(:ems_openshift) { FactoryBot.create(:ems_openshift) }
    let(:ems_rhev) { FactoryBot.create(:ems_redhat) }
    let(:vm_rhev) { FactoryBot.create(:vm_redhat, :uid_ems => "558d9a08-7b13-11e5-8546-129aa6621998", :ext_management_system => ems_rhev) }

    it "provider has unknown status when no authentication exists" do
      allow(container_topology_service).to receive(:retrieve_providers).with(anything, ManageIQ::Providers::ContainerManager).and_return([ems_openshift])
      container_topology_service.instance_variable_set(:@entity, ems_openshift)
      expect(subject[:items]).to eq(
        "ContainerManager" + ems_openshift.id.to_s => {:name         => ems_openshift.name,
                                                       :status       => "Unknown",
                                                       :kind         => "ContainerManager",
                                                       :display_kind => "Openshift",
                                                       :miq_id       => ems_openshift.id,
                                                       :model        => ems_openshift.class.name,
                                                       :key          => "ContainerManager" + ems_openshift.id.to_s}
      )
    end

    it "topology contains the expected structure and content" do
      # vm and host test cross provider correlation to infra provider
      hardware = FactoryBot.create(:hardware, :cpu_sockets => 2, :cpu_cores_per_socket => 4, :cpu_total_cores => 8)
      host = FactoryBot.create(:host_redhat,
                                :uid_ems               => "abcd9a08-7b13-11e5-8546-129aa6621999",
                                :ext_management_system => ems_rhev,
                                :hardware              => hardware)
      vm_rhev.update(:host => host, :raw_power_state => "up")

      allow(container_topology_service).to receive(:retrieve_providers).and_return([ems_kube])
      container_topology_service.instance_variable_set(:@entity, ems_kube)
      container_replicator = ContainerReplicator.create(:ext_management_system => ems_kube,
                                                        :ems_ref               => "8f8ca74c-3a41-11e5-a79a-001a4a231290",
                                                        :name                  => "replicator1")
      container_route = ContainerRoute.create(:ext_management_system => ems_kube,
                                              :ems_ref               => "ab5za74c-3a41-11e5-a79a-001a4a231290",
                                              :name                  => "route-edge")
      container_group = ContainerGroup.create(:ext_management_system => ems_kube,
                                              :container_node        => container_node, :container_replicator => container_replicator,
                                              :name                  => "myPod", :ems_ref => "96c35ccd-3e00-11e5-a0d2-18037327aaeb",
                                              :phase                 => "Running", :containers => [container])
      container_service = ContainerService.create(:ext_management_system => ems_kube, :container_groups => [container_group],
                                                  :ems_ref               => "95e49048-3e00-11e5-a0d2-18037327aaeb",
                                                  :name                  => "service1", :container_routes => [container_route])
      expect(subject[:items]).to eq(
        "ContainerManager" + ems_kube.id.to_s                => {:name         => ems_kube.name,
                                                                 :status       => "Error",
                                                                 :kind         => "ContainerManager",
                                                                 :display_kind => "Kubernetes",
                                                                 :miq_id       => ems_kube.id,
                                                                 :model        => ems_kube.class.name,
                                                                 :key          => "ContainerManager" + ems_kube.id.to_s},
        "ContainerNode" + container_node.id.to_s             => {:name         => container_node.name,
                                                                 :status       => "Ready",
                                                                 :kind         => "ContainerNode",
                                                                 :display_kind => "Node",
                                                                 :miq_id       => container_node.id,
                                                                 :model        => container_node.class.name,
                                                                 :key          => "ContainerNode" + container_node.id.to_s},
        "ContainerReplicator" + container_replicator.id.to_s => {:name         => container_replicator.name,
                                                                 :status       => "OK",
                                                                 :kind         => "ContainerReplicator",
                                                                 :display_kind => "Replicator",
                                                                 :miq_id       => container_replicator.id,
                                                                 :model        => container_replicator.class.name,
                                                                 :key          => "ContainerReplicator" + container_replicator.id.to_s},
        "ContainerService" + container_service.id.to_s       => {:name         => container_service.name,
                                                                 :status       => "Unknown",
                                                                 :kind         => "ContainerService",
                                                                 :display_kind => "Service",
                                                                 :miq_id       => container_service.id,
                                                                 :model        => container_service.class.name,
                                                                 :key          => "ContainerService" + container_service.id.to_s},
        "ContainerGroup" + container_group.id.to_s           => {:name         => container_group.name,
                                                                 :status       => "Running",
                                                                 :kind         => "ContainerGroup",
                                                                 :display_kind => "Pod",
                                                                 :miq_id       => container_group.id,
                                                                 :model        => container_group.class.name,
                                                                 :key          => "ContainerGroup" + container_group.id.to_s},
        "ContainerRoute" + container_route.id.to_s           => {:name         => container_route.name,
                                                                 :status       => "Unknown",
                                                                 :kind         => "ContainerRoute",
                                                                 :display_kind => "Route",
                                                                 :miq_id       => container_route.id,
                                                                 :model        => container_route.class.name,
                                                                 :key          => "ContainerRoute" + container_route.id.to_s},
        "Container" + container.id.to_s                      => {:name         => container.name,
                                                                 :status       => "Running",
                                                                 :kind         => "Container",
                                                                 :display_kind => "Container",
                                                                 :miq_id       => container.id,
                                                                 :model        => container.class.name,
                                                                 :key          => "Container" + container.id.to_s},
        "Vm" + vm_rhev.id.to_s                               => {:name         => vm_rhev.name,
                                                                 :status       => "On",
                                                                 :kind         => "Vm",
                                                                 :display_kind => "VM",
                                                                 :miq_id       => vm_rhev.id,
                                                                 :provider     => ems_rhev.name,
                                                                 :model        => vm_rhev.class.name,
                                                                 :key          => "Vm" + vm_rhev.id.to_s},
        "Host" + host.id.to_s                                => {:name         => host.name,
                                                                 :status       => "On",
                                                                 :kind         => "Host",
                                                                 :display_kind => "Host",
                                                                 :miq_id       => host.id,
                                                                 :provider     => ems_rhev.name,
                                                                 :model        => host.class.name,
                                                                 :key          => "Host" + host.id.to_s},
      )

      expect(subject[:relations].size).to eq(8)
      expect(subject[:relations]).to include(
        {:source => "ContainerGroup" + container_group.id.to_s, :target => "ContainerReplicator" + container_replicator.id.to_s},
        {:source => "ContainerService" + container_service.id.to_s, :target => "ContainerRoute" + container_route.id.to_s},
        # cross provider correlations
        {:source => "Vm" + vm_rhev.id.to_s, :target => "Host" + host.id.to_s},
        {:source => "ContainerNode" + container_node.id.to_s, :target => "Vm" + vm_rhev.id.to_s},
        {:source => "ContainerNode" + container_node.id.to_s, :target => "ContainerGroup" + container_group.id.to_s},
        {:source => "ContainerManager" + ems_kube.id.to_s, :target => "ContainerNode" + container_node.id.to_s},
        {:source => "ContainerGroup" + container_group.id.to_s, :target => "Container" + container.id.to_s},
        {:source => "ContainerGroup" + container_group.id.to_s, :target => "ContainerService" + container_service.id.to_s}
      )
    end

    it "topology contains the expected structure when vm is off" do
      # vm and host test cross provider correlation to infra provider
      vm_rhev.update(:raw_power_state => "down")
      allow(container_topology_service).to receive(:retrieve_providers).and_return([ems_kube])
      container_topology_service.instance_variable_set(:@entity, ems_kube)
      container_group = ContainerGroup.create(:ext_management_system => ems_kube, :container_node => container_node,
                                              :name => "myPod", :ems_ref => "96c35ccd-3e00-11e5-a0d2-18037327aaeb",
                                              :phase => "Running", :containers => [container])
      container_service = ContainerService.create(:ext_management_system => ems_kube, :container_groups => [container_group],
                                                  :ems_ref => "95e49048-3e00-11e5-a0d2-18037327aaeb",
                                                  :name => "service1")
      allow(container_topology_service).to receive(:entities).and_return([[container_node], [container_service]])

      expect(subject[:items]).to eq(
        "ContainerNode" + container_node.id.to_s       => {:name         => container_node.name,
                                                           :status       => "Ready",
                                                           :kind         => "ContainerNode",
                                                           :display_kind => "Node",
                                                           :miq_id       => container_node.id,
                                                           :model        => container_node.class.name,
                                                           :key          => "ContainerNode" + container_node.id.to_s},
        "ContainerService" + container_service.id.to_s => {:name         => container_service.name,
                                                           :status       => "Unknown",
                                                           :kind         => "ContainerService",
                                                           :display_kind => "Service",
                                                           :miq_id       => container_service.id,
                                                           :model        => container_service.class.name,
                                                           :key          => "ContainerService" + container_service.id.to_s},
        "ContainerGroup" + container_group.id.to_s     => {:name         => container_group.name,
                                                           :status       => "Running",
                                                           :kind         => "ContainerGroup",
                                                           :display_kind => "Pod",
                                                           :miq_id       => container_group.id,
                                                           :model        => container_group.class.name,
                                                           :key          => "ContainerGroup" + container_group.id.to_s},
        "Container" + container.id.to_s                => {:name         => container.name,
                                                           :status       => "Running",
                                                           :kind         => "Container",
                                                           :display_kind => "Container",
                                                           :miq_id       => container.id,
                                                           :model        => container.class.name,
                                                           :key          => "Container" + container.id.to_s},
        "Vm" + vm_rhev.id.to_s                         => {:name         => vm_rhev.name,
                                                           :status       => "Off",
                                                           :kind         => "Vm",
                                                           :display_kind => "VM",
                                                           :miq_id       => vm_rhev.id,
                                                           :provider     => ems_rhev.name,
                                                           :model        => vm_rhev.class.name,
                                                           :key          => "Vm" + vm_rhev.id.to_s},
        "ContainerManager" + ems_kube.id.to_s          => {:name         => ems_kube.name,
                                                           :status       => "Error",
                                                           :kind         => "ContainerManager",
                                                           :display_kind => "Kubernetes",
                                                           :miq_id       => ems_kube.id,
                                                           :model        => ems_kube.class.name,
                                                           :key          => "ContainerManager" + ems_kube.id.to_s},
      )

      expect(subject[:relations].size).to eq(5)
      expect(subject[:relations]).to include(
        {:source => "ContainerGroup" + container_group.id.to_s, :target => "ContainerService" + container_service.id.to_s},
        # cross provider correlation
        {:source => "ContainerNode" + container_node.id.to_s, :target => "Vm" + vm_rhev.id.to_s},
        {:source => "ContainerManager" + ems_kube.id.to_s, :target => "ContainerNode" + container_node.id.to_s},
        {:source => "ContainerNode" + container_node.id.to_s, :target => "ContainerGroup" + container_group.id.to_s},
        {:source => "ContainerGroup" + container_group.id.to_s, :target => "Container" + container.id.to_s},
      )
    end
  end

  describe '#entity_status' do
    context 'entity is a container' do
      let(:entity) { FactoryBot.create(:container) }

      context 'state is not defined' do
        before { allow(entity).to receive(:state).and_return(nil) }

        it 'returns with nil' do
          expect(container_topology_service.entity_status(entity)).to be_nil
        end
      end
    end
  end
end
