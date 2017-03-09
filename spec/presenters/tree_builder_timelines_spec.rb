describe TreeBuilderTimelines do
  before do
    menu = [["Configuration Management", [["Hosts", ["Date brought under Management for Last Week"]]]]]
    FactoryGirl.create(:miq_report, :name => "Date brought under Management for Last Week")
    @timelines_tree = TreeBuilderTimelines.new(:timelines_tree, :timelines, {}, true, :menu => menu)
  end
  it 'set init options correctly' do
    tree_options = @timelines_tree.send(:tree_init_options, :timelines)
    expect(tree_options).to eq(:full_ids => true, :lazy => false, :add_root => false)
  end

  it 'set locals for render correctly' do
    locals = @timelines_tree.send(:set_locals_for_render)
    expect(locals).to include(:id_prefix  => 'timelines_',
                              :onclick    => "miqOnClickTimelineSelection",
                              :click_url  => "/dashboard/show_timeline/",
                              :tree_state => true)
  end

  it 'sets root to nothing' do
    roots = @timelines_tree.send(:root_options)
    expect(roots).to eq({})
  end

  it 'sets first level nodes correctly' do
    roots = @timelines_tree.send(:x_get_tree_roots, false, nil)
    expect(roots).to eq([:id          => "r__Configuration Management",
                         :text        => t = "Configuration Management",
                         :icon        => 'pficon pficon-folder-close',
                         :tip         => t,
                         :cfmeNoClick => true,
                         :expand      => true,
                         :subsections => [["Hosts", ["Date brought under Management for Last Week"]]]
                        ])
  end

  it 'sets second level nodes correctly' do
    root = @timelines_tree.send(:x_get_tree_roots, false, nil).first
    nodes = @timelines_tree.send(:x_get_tree_hash_kids, root, false)
    expect(nodes).to eq([:id          => "p__Hosts",
                         :text        =>      "Hosts",
                         :icon        => 'pficon pficon-folder-close',
                         :tip         => _("Group: %{:name}" % {:name => "Hosts"}),
                         :expand      => false,
                         :cfmeNoClick => true,
                         :subsections => ["Date brought under Management for Last Week"]
                        ])
  end

  it 'sets third level nodes correctly' do
    root = @timelines_tree.send(:x_get_tree_roots, false, nil).first
    node = @timelines_tree.send(:x_get_tree_hash_kids, root, false).first
    children = @timelines_tree.send(:x_get_tree_hash_kids, node, false)
    expect(children.first).to include(:text        => t = "Date brought under Management for Last Week",
                                      :icon        => "fa fa-arrow-circle-o-right",
                                      :tip         => _("Report: %{:name}" % {:name => t}),
                                      :subsections => [])
  end
end
