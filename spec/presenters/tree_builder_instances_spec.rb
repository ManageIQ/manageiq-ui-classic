describe TreeBuilderInstances do
  before do
    @vm_cloud_with_az = FactoryBot.create(:vm_cloud,
                                           :ext_management_system => FactoryBot.create(:ems_google),
                                           :storage               => FactoryBot.create(:storage),
                                           :availability_zone     => FactoryBot.create(:availability_zone_google))
    @vm_cloud_without_az = FactoryBot.create(:vm_cloud,
                                              :ext_management_system => FactoryBot.create(:ems_google),
                                              :storage               => FactoryBot.create(:storage),)

    login_as FactoryBot.create(:user_with_group, :role => "operator", :settings => {})

    allow(MiqServer).to receive(:my_server) { FactoryBot.create(:miq_server) }

    @instances_tree = TreeBuilderInstances.new(:instances_tree, {}, nil)
  end

  it 'sets tree to have leaf and not lazy' do
    root_options = @instances_tree.tree_init_options

    expect(root_options).to eq(:allow_reselect => true)
  end

  it 'sets tree to have full ids, not lazy and no root' do
    locals = @instances_tree.send(:set_locals_for_render)

    expect(locals[:tree_id]).to eq("instances_treebox")
    expect(locals[:tree_name]).to eq("instances_tree")
  end

  it 'sets root correctly' do
    root = @instances_tree.root_options

    expect(root).to eq(:text => "Instances by Provider", :tooltip => "All Instances by Provider that I can see")
  end

  it 'sets providers nodes correctly' do
    allow(@instances_tree).to receive(:role_allows?).and_return(true)
    providers = @instances_tree.send(:x_get_tree_roots)

    expect(providers).to eq([@vm_cloud_with_az.ext_management_system,
                             @vm_cloud_without_az.ext_management_system,
                             {:id              => "arch",
                              :text            => "<Archived>",
                              :icon            => "fa fa-archive",
                              :icon_background => "#336699",
                              :color           => '#fff',
                              :tip             => "Archived Instances"},
                             {:id              => "orph",
                              :text            => "<Orphaned>",
                              :icon            => "ff ff-orphaned",
                              :icon_background => "#336699",
                              :color           => '#fff',
                              :tip             => "Orphaned Instances"}])
  end

  it 'sets availability zones correctly if vms are hidden' do
    provider_with_az = @instances_tree.send(:x_get_tree_roots)[0] # provider with vm that has availability zone
    provider_without_az = @instances_tree.send(:x_get_tree_roots)[1] # provider with vm that doesn't have availability zone
    allow(provider_with_az).to receive(:availability_zones) { [@vm_cloud_with_az.availability_zone] }
    az = @instances_tree.x_get_tree_ems_kids(provider_with_az, false)
    vm_without_az = @instances_tree.x_get_tree_ems_kids(provider_without_az, false)

    expect(az).to eq(provider_with_az.availability_zones)
    expect(vm_without_az).to eq([])
  end
end
