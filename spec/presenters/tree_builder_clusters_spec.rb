describe TreeBuilderClusters do
  context 'TreeBuilderClusters' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Clusters Group")
      login_as FactoryBot.create(:user, :userid => 'clusters__wilma', :miq_groups => [@group])
      @ho_enabled = [FactoryBot.create(:host)]
      @ho_disabled = [FactoryBot.create(:host)]
      allow(EmsCluster).to receive(:get_perf_collection_object_list).and_return(:'1'.to_i =>
                                                                                             {:id          => 1,
                                                                                              :name        => 'Name',
                                                                                              :capture     => 'unsure',
                                                                                              :ho_enabled  => @ho_enabled,
                                                                                              :ho_disabled => @ho_disabled})
      @non_cluster_hosts = [{:id => 2, :name => 'Non Cluster Host', :capture => true}]
      @cluster = {:clusters => [{:id => 1, :name => 'Name', :capture => 'unsure'}], :non_cl_hosts => @non_cluster_hosts}
      @cluster_tree = TreeBuilderClusters.new(:cluster_tree, {}, true, :root => @cluster)
    end

    it 'sets tree to have full ids, not lazy and no root' do
      root_options = @cluster_tree.send(:tree_init_options)
      expect(root_options).to eq(
        :full_ids     => false,
        :checkboxes   => true,
        :three_checks => true,
        :oncheck      => "miqOnCheckCUFilters",
        :check_url    => "/ops/cu_collection_field_changed/"
      )
    end

    it 'sets tree to have full ids, not lazy and no root' do
      locals = @cluster_tree.send(:set_locals_for_render)
      expect(locals[:checkboxes]).to eq(true)
      expect(locals[:oncheck]).to eq("miqOnCheckCUFilters")
      expect(locals[:check_url]).to eq("/ops/cu_collection_field_changed/")
    end

    it 'set cluster nodes correctly' do
      cluster_nodes = @cluster_tree.send(:x_get_tree_roots)
      expect(cluster_nodes.first).to eq(:id         => "1",
                                        :text       => "Name",
                                        :icon       => 'pficon pficon-cluster',
                                        :tip        => "Name",
                                        :checked    => 'unsure',
                                        :selectable => false,
                                        :nodes      => @ho_enabled + @ho_disabled)
      # non-cluster-node
      expect(cluster_nodes.last).to eq(:id         => "NonCluster",
                                       :text       => "Non-clustered Hosts",
                                       :icon       => 'pficon pficon-container-node',
                                       :tip        => "Non-clustered Hosts",
                                       :checked    => true,
                                       :selectable => false,
                                       :nodes      => @non_cluster_hosts)
    end

    it 'sets non-cluster host nodes correctly' do
      cluster_nodes = @cluster_tree.send(:x_get_tree_roots)
      non_cluster_host = @cluster_tree.send(:x_get_tree_hash_kids, cluster_nodes.last, false)
      expect(non_cluster_host).to eq([{:id         => "NonCluster_2",
                                       :text       => "Non Cluster Host",
                                       :tip        => "Host: Non Cluster Host",
                                       :icon       => 'pficon pficon-container-node',
                                       :checked    => true,
                                       :selectable => false,
                                       :nodes      => []}])
    end

    it 'sets cluster hosts nodes correctly' do
      cluster_nodes = @cluster_tree.send(:x_get_tree_roots)
      cluster_hosts = @cluster_tree.send(:x_get_tree_hash_kids, cluster_nodes.first, false)
      cluster_hosts_expected = @ho_enabled.map do |node|
        {:id         => "#{cluster_nodes.first[:id]}_#{node[:id]}",
         :text       => node[:name],
         :tip        => "Host: %{name}" % {:name => node[:name]},
         :icon       => 'pficon pficon-container-node',
         :checked    => true,
         :selectable => false,
         :nodes      => []}
      end
      cluster_hosts_expected += @ho_disabled.map do |node|
        {:id         => "#{cluster_nodes.first[:id]}_#{node[:id]}",
         :text       => node[:name],
         :tip        => "Host: %{name}" % {:name => node[:name]},
         :icon       => 'pficon pficon-container-node',
         :checked    => false,
         :selectable => false,
         :nodes      => []}
      end
      expect(cluster_hosts).to eq(cluster_hosts_expected)
    end
  end
end
