describe TreeBuilderDatacenter do
  context 'TreeBuilderDatacenter Cluster root' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Datacenter Group Cluster root")
      login_as FactoryBot.create(:user, :userid => 'datacenter_wilma', :miq_groups => [@group])
      host = FactoryBot.create(:host)

      vm = FactoryBot.create(:vm)
      cluster = FactoryBot.create(:ems_cluster, :hosts => [host], :vms => [vm])
      class << cluster
        def resource_pools
          [FactoryBot.create(:resource_pool)]
        end
      end
      @datacenter_tree = TreeBuilderDatacenter.new(:datacenter_tree, :datacenter, {}, true, cluster)
    end

    it 'returns EmsCluster as root' do
      root = @datacenter_tree.send(:root_options)
      expect(root).to eq(
        :text    => @datacenter_tree.instance_variable_get(:@root).name,
        :tooltip => "Cluster: #{@datacenter_tree.instance_variable_get(:@root).name}",
        :icon    => "pficon pficon-cluster"
      )
    end

    it 'returns right kind of children' do
      kids = @datacenter_tree.send(:x_get_tree_roots, false)
      expect(kids[0]).to be_a_kind_of(Host)
      expect(kids[1]).to be_a_kind_of(ResourcePool)
      expect(kids[2]).to be_a_kind_of(Vm)
    end
  end

  context 'TreeBuilderDatacenter Resource pool root' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group,
                                  :miq_user_role => role,
                                  :description   => "Datacenter Group Resource pool root")
      login_as FactoryBot.create(:user, :userid => 'datacenter_wilma', :miq_groups => [@group])
      cluster = FactoryBot.create(:resource_pool)
      class << cluster
        def resource_pools
          [FactoryBot.create(:resource_pool)]
        end

        def vms
          [FactoryBot.create(:vm)]
        end
      end
      @datacenter_tree = TreeBuilderDatacenter.new(:datacenter_tree, :datacenter, {}, true, cluster)
    end

    it 'returns ResourcePool as root' do
      root = @datacenter_tree.send(:root_options)
      expect(root).to eq(
        :text    => @datacenter_tree.instance_variable_get(:@root).name,
        :tooltip => "Resource Pool: #{@datacenter_tree.instance_variable_get(:@root).name}",
        :icon    => "pficon-resource-pool"
      )
    end

    it 'returns right kind of children' do
      kids = @datacenter_tree.send(:x_get_tree_roots, false)
      expect(kids[0]).to be_a_kind_of(ResourcePool)
      expect(kids[1]).to be_a_kind_of(Vm)
    end
  end
end
