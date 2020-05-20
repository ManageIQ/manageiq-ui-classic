describe TreeBuilderSmartproxyAffinity do
  context 'TreeBuilderSmartproxyAffinity' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "SmartProxy Affinity Group")
      login_as FactoryBot.create(:user, :userid => 'smartproxy_affinity_wilma', :miq_groups => [@group])

      @selected_zone = FactoryBot.create(:zone, :name => 'zone1')

      @storage1 = FactoryBot.create(:storage)
      @storage2 = FactoryBot.create(:storage)

      @host1 = FactoryBot.create(:host, :name => 'host1', :storages => [@storage1])
      @host2 = FactoryBot.create(:host, :name => 'host2', :storages => [@storage2])

      @ems = FactoryBot.create(:ext_management_system, :hosts => [@host1, @host2], :zone => @selected_zone)

      @svr1 = FactoryBot.create(:miq_server, :name => 'svr1', :zone => @selected_zone)
      @svr2 = FactoryBot.create(:miq_server, :name => 'svr2', :zone => @selected_zone)

      @svr1.vm_scan_host_affinity = [@host1]
      @svr2.vm_scan_host_affinity = [@host2]
      @svr1.vm_scan_storage_affinity = [@storage1]
      @svr2.vm_scan_storage_affinity = [@storage2]

      allow_any_instance_of(MiqServer).to receive_messages(:is_a_proxy? => true)
      allow(MiqServer).to receive(:my_server).and_return(OpenStruct.new('id' => 0, :name => 'name'))

      @smartproxy_affinity_tree = TreeBuilderSmartproxyAffinity.new(:smartproxy_affinity_tree,
                                                                    {},
                                                                    true,
                                                                    :data => @selected_zone)
    end

    it 'set init options correctly' do
      tree_options = @smartproxy_affinity_tree.send(:tree_init_options)
      expect(tree_options).to eq(
        :full_ids     => false,
        :checkboxes   => true,
        :three_checks => true,
        :post_check   => true,
        :check_url    => "/ops/smartproxy_affinity_field_changed/",
        :oncheck      => "miqOnCheckGeneric"
      )
    end
    it 'set locals for render correctly' do
      locals = @smartproxy_affinity_tree.send(:set_locals_for_render)
      expect(locals[:checkboxes]).to eq(true)
      expect(locals[:check_url]).to eq('/ops/smartproxy_affinity_field_changed/')
      expect(locals[:oncheck]).to eq('miqOnCheckGeneric')
      expect(locals[:hierarchical_check]).to eq(true)
    end
    it 'sets roots correctly' do
      roots = @smartproxy_affinity_tree.send(:x_get_tree_roots)
      expect(roots).to eq([@svr1, @svr2])
    end
    it 'sets MiqServer kids correctly' do
      kids1 = @smartproxy_affinity_tree.send(:x_get_server_kids, @svr1, false)
      kids2 = @smartproxy_affinity_tree.send(:x_get_server_kids, @svr2, false)
      expect(kids1.size).to eq(2)
      expect(kids2.size).to eq(2)
      expect(kids1.first).to eq(:id              => "#{@svr1[:id]}__host",
                                :icon            => "pficon pficon-container-node",
                                :parent          => @svr1,
                                :text            => "Hosts",
                                :selectable      => false,
                                :nodes           => @selected_zone.send('host'.pluralize).sort_by(&:name),
                                :smartproxy_kind => "host")
      expect(kids2.first).to eq(:id              => "#{@svr2[:id]}__host",
                                :icon            => "pficon pficon-container-node",
                                :parent          => @svr2,
                                :text            => "Hosts",
                                :selectable      => false,
                                :nodes           => @selected_zone.send('host'.pluralize).sort_by(&:name),
                                :smartproxy_kind => "host")
      expect(kids1.last).to eq(:id              => "#{@svr1[:id]}__storage",
                               :icon            => "fa fa-database",
                               :parent          => @svr1,
                               :text            => "Datastores",
                               :selectable      => false,
                               :nodes           => @selected_zone.send('storage'.pluralize).sort_by(&:name),
                               :smartproxy_kind => "storage")
      expect(kids2.last).to eq(:id              => "#{@svr2[:id]}__storage",
                               :icon            => "fa fa-database",
                               :parent          => @svr2,
                               :text            => "Datastores",
                               :selectable      => false,
                               :nodes           => @selected_zone.send('storage'.pluralize).sort_by(&:name),
                               :smartproxy_kind => "storage")
    end

    it 'sets Datastores kids correctly' do
      parent1 = @smartproxy_affinity_tree.send(:x_get_server_kids, @svr1, false).first
      parent2 = @smartproxy_affinity_tree.send(:x_get_server_kids, @svr2, false).first
      parent3 = @smartproxy_affinity_tree.send(:x_get_server_kids, @svr1, false).last
      parent4 = @smartproxy_affinity_tree.send(:x_get_server_kids, @svr2, false).last
      parents = [parent1, parent2, parent3, parent4]
      parents.each do |parent|
        kids = @smartproxy_affinity_tree.send(:x_get_tree_hash_kids, parent, false)
        parent[:nodes].each_with_index do |kid, i|
          expect(kids[i][:image]).to eq(parent[:image])
          expect(kids[i][:text]).to eq(kid.name)
          expect(kids[i][:id]).to eq("#{parent[:id]}_#{kid.id}")
          expect(kids[i][:nodes]).to eq([])
          expect(kids[i][:checked]).to eq(parent[:parent].send("vm_scan_#{parent[:smartproxy_kind]}_affinity").collect(&:id).include?(kid.id))
        end
      end
    end
  end
end
