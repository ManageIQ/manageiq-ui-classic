describe TreeBuilderDatastores do
  context 'TreeBuilderDatastores' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Datastores Group")
      login_as FactoryBot.create(:user, :userid => 'datastores_wilma', :miq_groups => [group])
      @host = FactoryBot.create(:host, :name => 'Host Name')
      storage = FactoryBot.create(:storage, :hosts => [@host])

      @datastore = {
        storage.id => {
          :id       => storage.id,
          :st_rec   => storage,
          :name     => 'Datastore',
          :location => 'Location',
          :capture  => false
        }
      }

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

    it 'sets Datastore node correctly' do
      parent = @datastores_tree.send(:x_get_tree_roots)
      expect(parent.length).to eq(1)
    end

    it 'sets Host node correctly' do
      parent = @datastores_tree.send(:x_get_tree_roots)
      kids = @datastores_tree.send(:x_get_tree_storage_kids, parent.first, false)
      expect(kids.length).to eq(1)
    end
  end
end
