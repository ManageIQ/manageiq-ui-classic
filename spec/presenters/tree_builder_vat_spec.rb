describe TreeBuilderVat do
  context 'TreeBuilderVat' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Vat Group")
      login_as FactoryBot.create(:user, :userid => 'datacenter_wilma', :miq_groups => [@group])
      cluster = FactoryBot.create(:ems_cluster)
      class << cluster
        def children
          [OpenStruct.new(:datacenters_only => [FactoryBot.create(:datacenter)],
                          :folders_only     => [FactoryBot.create(:ems_folder)],
                          :name             => 'Datacenters',)]
        end

        def image_name
          'cluster'
        end
      end
      @vat_tree = TreeBuilderVat.new(:vat_tree, :vat, {}, true, cluster, true)
    end

    it 'returns EmsCluster as root' do
      root = @vat_tree.send(:root_options)
      expect(root).to eq(
        :text    => @vat_tree.instance_variable_get(:@root).name,
        :tooltip => @vat_tree.instance_variable_get(:@root).name,
        :image   => nil
      )
    end

    it 'returns children correctly' do
      kids = @vat_tree.send(:x_get_tree_roots, false)
      expect(kids[0]).to be_a_kind_of(EmsFolder)
      expect(kids[1]).to be_a_kind_of(Datacenter)
    end
  end
end
