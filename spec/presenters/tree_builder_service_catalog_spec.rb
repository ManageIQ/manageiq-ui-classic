describe TreeBuilderServiceCatalog do
  before do
    Tenant.seed
    @catalog = FactoryBot.create(:service_template_catalog, :name => "My Catalog")

    FactoryBot.create(:service_template_ansible_playbook,
                       :name                     => "Display in Catalog",
                       :service_template_catalog => @catalog,
                       :display                  => true)
    FactoryBot.create(:service_template,
                       :name                     => "Do not Display in Catalog",
                       :service_template_catalog => @catalog,
                       :display                  => false)
    FactoryBot.create(:service_template,
                       :name                     => "Display in Catalog too",
                       :service_type             => 'generic_ansible_tower',
                       :service_template_catalog => @catalog,
                       :display                  => true)
    FactoryBot.create(:service_template_ansible_playbook,
                       :service_type             => 'generic_ansible_playbook',
                       :name                     => "Display in Catalog Playbook",
                       :service_template_catalog => @catalog,
                       :display                  => true)
    @tree = TreeBuilderServiceCatalog.new(:svccat_tree, {})
  end

  it "#x_get_tree_roots" do
    roots = @tree.send(:x_get_tree_roots, false)
    expect(roots.first.name).to eq(@catalog.name)
  end

  it "#x_get_tree_stc_kids returns items that are set to be displayed in catalog" do
    items = @tree.send(:x_get_tree_stc_kids, @catalog, false)
    expect(items.size).to eq(3)
    expect(items.first.name).to eq("Display in Catalog")
  end
end
