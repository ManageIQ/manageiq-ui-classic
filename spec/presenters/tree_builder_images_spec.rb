describe TreeBuilderImages do
  before do
    @template_cloud_with_az = FactoryBot.create(:template_cloud,
                                                 :ext_management_system => FactoryBot.create(:ems_google),
                                                 :storage               => FactoryBot.create(:storage))

    login_as FactoryBot.create(:user_with_group, :role => "operator", :settings => {})

    allow(MiqServer).to receive(:my_server) { FactoryBot.create(:miq_server) }

    @images_tree = TreeBuilderImages.new(:images_tree, {}, nil)
  end

  it 'sets tree to have leaf and not lazy' do
    root_options = @images_tree.tree_init_options
    expect(root_options).to eq(:lazy => true, :allow_reselect => true)
  end

  it 'sets tree to have full ids, not lazy and no root' do
    locals = @images_tree.send(:set_locals_for_render)
    expect(locals[:tree_id]).to eq("images_treebox")
    expect(locals[:tree_name]).to eq("images_tree")
    expect(locals[:autoload]).to eq(true)
  end

  it 'sets root correctly' do
    root = @images_tree.root_options
    expect(root).to eq(
      :text    => "Images by Provider",
      :tooltip => "All Images by Provider that I can see"
    )
  end

  it 'sets providers nodes correctly' do
    allow(@images_tree).to receive(:role_allows?).and_return(true)
    providers = @images_tree.send(:x_get_tree_roots)
    expect(providers).to eq([@template_cloud_with_az.ext_management_system,
                             {:id              => "arch",
                              :text            => "<Archived>",
                              :icon            => "fa fa-archive",
                              :icon_background => "#336699",
                              :color           => '#fff',
                              :tip             => "Archived Images"},
                             {:id              => "orph",
                              :text            => "<Orphaned>",
                              :icon            => "ff ff-orphaned",
                              :icon_background => "#336699",
                              :color           => '#fff',
                              :tip             => "Orphaned Images"}])
  end
end
