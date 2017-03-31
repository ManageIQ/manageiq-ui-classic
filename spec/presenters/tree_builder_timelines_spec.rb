describe TreeBuilderTimelines do
  before do
    FactoryGirl.create(:miq_report, :name => "Date brought under Management for Last Week")
    end
  let!(:menu) { [["Configuration Management",
                     [["Hosts",
                       ["Date brought under Management for Last Week"]]]]]}
  let!(:timelines_tree) {TreeBuilderTimelines.new(:timelines_tree, :timelines, {}, true, :menu => menu)}

  it 'set init options correctly' do
    tree_options = timelines_tree.send(:tree_init_options, :timelines)
    expect(tree_options).to eq(:full_ids => true, :lazy => false, :add_root => false)
  end

  it 'set locals for render correctly' do
    locals = timelines_tree.send(:set_locals_for_render)
    expect(locals).to include(:id_prefix  => 'timelines_',
                              :onclick    => "miqOnClickTimelineSelection",
                              :click_url  => "/dashboard/show_timeline/",
                              :tree_state => true)
  end

  it 'sets root to nothing' do
    roots = timelines_tree.send(:root_options)
    expect(roots).to eq({})
  end

  it 'sets first level nodes correctly' do
    roots = timelines_tree.send(:x_get_tree_roots, false, nil)
    expect(roots.length).to eq(1)
    root = roots.first
    expect(root[:id]).to eq("r__Configuration Management")
    title = menu[0][0] # "Configuration Management"
    expect(root[:text]).to eq(title)
    expect(root[:icon]).to eq('pficon pficon-folder-close')
    expect(root[:tip]).to eq(title)
    expect(root[:cfmeNoClick]).to be true
    expect(root[:expand]).to be true
    expect(root[:subsections]).to eq(menu[0][1]) # [["Hosts", ["Date brought under Management for Last Week"]]
  end

  it 'sets second level nodes correctly' do
    root = timelines_tree.send(:x_get_tree_roots, false, nil).first
    nodes = timelines_tree.send(:x_get_tree_hash_kids, root, false)
    expect(nodes.length).to eq(1)
    node = nodes.first
    expect(node[:id]).to eq("p__Hosts")
    title = menu[0][1][0][0] # "Hosts"
    subsection = menu[0][1][0][1] # ["Date brought under Management for Last Week"]
    expect(node[:text]).to eq(title)
    expect(node[:icon]).to eq('pficon pficon-folder-close')
    expect(node[:tip]).to eq("Group: %{:name}" % {:name => title})
    expect(node[:expand]).to be false
    expect(node[:cfmeNoClick]).to be true
    expect(node[:subsections]).to eq(subsection)
  end

  it 'sets third level nodes correctly' do
    root = timelines_tree.send(:x_get_tree_roots, false, nil).first
    node = timelines_tree.send(:x_get_tree_hash_kids, root, false).first
    children = timelines_tree.send(:x_get_tree_hash_kids, node, false)
    expect(children.length).to eq(1)
    child = children.first
    title = menu[0][1][0][1][0] # "Date brought under Management for Last Week"
    expect(child[:text]).to eq(title)
    expect(child[:icon]).to eq("fa fa-arrow-circle-o-right")
    expect(child[:tip]).to eq("Report: %{:name}" % {:name => title})
    expect(child[:subsections]).to eq([])
  end
end
