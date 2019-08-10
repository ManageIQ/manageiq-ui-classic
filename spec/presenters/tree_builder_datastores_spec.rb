describe TreeBuilderDatastores do
  context 'TreeBuilderDatastores' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Datastores Group")
      login_as FactoryBot.create(:user, :userid => 'datastores_wilma', :miq_groups => [@group])
      @host = FactoryBot.create(:host, :name => 'Host Name')
      storage = FactoryBot.create(:storage, :hosts => [@host])
      @datastore = [{:id => storage.id, :name => 'Datastore', :location => 'Location', :capture => false}]
      @datastores_tree = TreeBuilderDatastores.new(:datastore, {}, true, :root => @datastore)
    end
    it 'sets tree to have full ids, not lazy and no root' do
      root_options = @datastores_tree.send(:tree_init_options)
      expect(root_options).to eq(
        :full_ids   => false,
        :checkboxes => true,
        :check_url  => "/ops/cu_collection_field_changed/",
        :oncheck    => "miqOnCheckCUFilters"
      )
    end
    it 'sets locals correctly' do
      locals = @datastores_tree.send(:set_locals_for_render)
      expect(locals[:checkboxes]).to eq(true)
      expect(locals[:oncheck]).to eq("miqOnCheckCUFilters")
      expect(locals[:check_url]).to eq("/ops/cu_collection_field_changed/")
    end
    it 'sets Datastore node correctly' do
      parent = @datastores_tree.send(:x_get_tree_roots, false)
      expect(parent.first[:text]).to eq("<strong>Datastore</strong> [#{@datastore.first[:location]}]")
      expect(parent.first[:tip]).to eq("Datastore [#{@datastore.first[:location]}]")
      expect(parent.first[:icon]).to eq('fa fa-database')
    end
    it 'sets Host node correctly' do
      parent = @datastores_tree.send(:x_get_tree_roots, false)
      kids = @datastores_tree.send(:x_get_tree_hash_kids, parent.first, false)
      expect(kids.first[:text]).to eq(@host[:name])
      expect(kids.first[:tip]).to eq(@host[:name])
      expect(kids.first[:icon]).to eq('pficon pficon-container-node')
      expect(kids.first[:hideCheckbox]).to eq(true)
      expect(kids.first[:selectable]).to eq(false)
      expect(kids.first[:nodes]).to eq([])
    end
  end
end
