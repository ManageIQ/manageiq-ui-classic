describe TreeBuilderStorageAdapters do
  context 'TreeBuilderStorageAdapters' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "SA Group")
      login_as FactoryBot.create(:user, :userid => 'sa_wilma', :miq_groups => [@group])
      host = FactoryBot.create(:host)
      class << host
        def hardware
          OpenStruct.new(:storage_adapters => [FactoryBot.create(:miq_scsi_target,
                                                                  :miq_scsi_luns => [FactoryBot.create(:miq_scsi_lun),
                                                                                     FactoryBot.create(:miq_scsi_lun),
                                                                                     FactoryBot.create(:miq_scsi_lun)])])
        end
      end
      @sa_tree = TreeBuilderStorageAdapters.new(:sa_tree, {}, true, :root => host)
    end

    it 'returns Host as root' do
      root = @sa_tree.send(:root_options)
      expect(root).to eq(
        :text    => @sa_tree.instance_variable_get(:@root).name,
        :tooltip => "Host: #{@sa_tree.instance_variable_get(:@root).name}",
        :icon    => 'pficon pficon-container-node'
      )
    end

    it 'returns MiqScsiTarget as children of root' do
      kids = @sa_tree.send(:x_get_tree_roots)
      expect(kids.first).to be_a_kind_of(MiqScsiTarget)
    end

    it 'returns MiqScsiLun as MiqScsiTarget children' do
      parent = @sa_tree.send(:x_get_tree_roots).first
      kids = @sa_tree.send(:x_get_tree_target_kids, parent, false)
      number_of_kids = @sa_tree.send(:x_get_tree_target_kids, parent, true)
      expect(kids.first).to be_a_kind_of(MiqScsiLun)
      expect(number_of_kids).to eq(3)
    end

    it 'returns nothing as MiqScsiLun children' do
      root = @sa_tree.send(:x_get_tree_roots).first
      parent = @sa_tree.send(:x_get_tree_target_kids, root, false).first
      number_of_kids = @sa_tree.send(:x_get_tree_objects, parent, true, nil)
      kids = @sa_tree.send(:x_get_tree_objects, parent, false, nil)
      expect(number_of_kids).to eq(0)
      expect(kids).to eq([])
    end
  end
end
