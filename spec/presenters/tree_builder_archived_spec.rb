describe TreeBuilderArchived do
  let(:archived) { Class.new { extend TreeBuilderArchived } }
  before do
    allow(archived).to receive(:count_only_or_objects_filtered) do |count_only, objects, name|
      count_only ? objects.size : objects.sort_by { |object| object[name.to_sym] }
    end
    login_as FactoryBot.create(:user_with_group, :role => "operator", :settings => {})
  end

  it '#x_get_tree_arch_orph_nodes' do
    allow(archived).to receive(:role_allows?).and_return(true)
    nodes = archived.x_get_tree_arch_orph_nodes('VMs/Templates')
    expect(nodes).to eq([{:id              => "arch",
                          :text            => "<Archived>",
                          :icon            => "fa fa-archive",
                          :icon_background => "#336699",
                          :tip             => "Archived VMs/Templates"},
                         {:id              => "orph",
                          :text            => "<Orphaned>",
                          :icon            => "ff ff-orphaned",
                          :icon_background => "#336699",
                          :tip             => "Orphaned VMs/Templates"}])
  end
end
