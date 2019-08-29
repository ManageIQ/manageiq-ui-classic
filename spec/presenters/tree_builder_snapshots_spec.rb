describe TreeBuilderSnapshots do
  context 'TreeBuilderSnaphots' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Snapshot Group")
      login_as FactoryBot.create(:user, :userid => 'snapshot_wilma', :miq_groups => [group])

      s1.children.push(s2)
      s2.parent_id = s1.id
    end

    let(:vm) { FactoryBot.create(:vm_infra, :snapshots => [s1]) }

    let(:s1) do
      FactoryBot.create(:snapshot, :description => 'Snapshot',
                                   :create_time => Time.zone.local(2000, "jan", 1, 20, 15, 1))
    end

    let(:s2) do
      FactoryBot.create(:snapshot, :description => 'Snapshot Kid',
                                   :create_time => Time.zone.local(2000, "jan", 1, 20, 15, 1))
    end

    let(:tree) { TreeBuilderSnapshots.new(:snapshot_tree, {}, true, :root => vm) }

    it 'sets root correctly' do
      root = tree.send(:root_options)
      expect(root).to eq(
        :text       => vm.name,
        :tooltip    => vm.name,
        :icon       => 'pficon pficon-virtual-machine',
        :selectable => false
      )
    end

    it 'returns Snapshot as kids of root' do
      snapshot_nodes = tree.send(:x_get_tree_roots)
      snapshot_nodes.each do |snapshot_node|
        expect(snapshot_node).to be_a_kind_of(Snapshot)
      end
    end

    it 'returns Snapshot as kids of Snapshot' do
      snapshot_parent = tree.send(:x_get_tree_roots).first
      snapshot_nodes = tree.send(:x_get_tree_snapshot_kids, snapshot_parent, false)
      snapshot_nodes.each do |snapshot_node|
        expect(snapshot_node).to be_a_kind_of(Snapshot)
      end
    end

    it 'selects the last node in the tree' do
      sandbox = tree.instance_variable_get(:@sb)
      expect(sandbox[:trees][:snapshot_tree][:active_node].split('-').last).to eq(s2.id.to_s)
    end
  end
end
