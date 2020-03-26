describe TreeBuilderClusters do
  context 'TreeBuilderClusters' do
    let(:cluster) { FactoryBot.create(:ems_cluster) }
    let(:ems) { FactoryBot.create(:ext_management_system) }

    let(:host_1) { FactoryBot.create(:host, :ems_cluster => cluster) }
    let(:host_2) { FactoryBot.create(:host, :ems_cluster => cluster) }
    let(:host_3) { FactoryBot.create(:host, :ext_management_system => ems) }

    before do
      MiqRegion.seed
      login_as FactoryBot.create(:user_admin)

      allow(host_1).to receive(:perf_capture_enabled?).and_return(true)
      allow(host_2).to receive(:perf_capture_enabled?).and_return(false)
    end

    subject { TreeBuilderClusters.new(:cluster_tree, {}, true) }

    it 'sets tree to have full ids, not lazy and no root' do
      root_options = subject.send(:tree_init_options)
      expect(root_options).to eq(
        :full_ids     => false,
        :post_check   => true,
        :checkboxes   => true,
        :three_checks => true,
        :oncheck      => "miqOnCheckGeneric",
        :check_url    => "/ops/cu_collection_field_changed/"
      )
    end

    describe '#x_get_tree_roots' do
      context 'nonclustered nodes available' do
        before { allow(host_3).to receive(:perf_capture_enabled?).and_return(true) }

        it 'sets root nodes' do
          nodes = subject.send(:x_get_tree_roots)
          expect(nodes.length).to eq(2)
        end
      end

      it 'sets root nodes' do
        nodes = subject.send(:x_get_tree_roots)
        expect(nodes.length).to eq(1)
      end
    end

    describe '#x_get_tree_cluster_kids' do
      it 'sets cluster kids' do
        nodes = subject.send(:x_get_tree_cluster_kids, cluster, false)
        expect(nodes.length).to eq(2)
      end
    end

    describe '#x_get_tree_hash_kids' do
      before { allow(host_3).to receive(:perf_capture_enabled?).and_return(true) }

      it 'sets nonclustered hosts' do
        nodes = subject.send(:x_get_tree_hash_kids, {}, false)
        expect(nodes.length).to eq(1)
      end
    end
  end
end
