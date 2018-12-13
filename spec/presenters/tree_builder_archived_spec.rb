describe TreeBuilderArchived do
  let(:archived) { Class.new { extend TreeBuilderArchived } }
  before do
    allow(archived).to receive(:count_only_or_objects_filtered) do |count_only, objects, name|
      count_only ? objects.size : objects.sort_by { |object| object[name.to_sym] }
    end
    login_as FactoryBot.create(:user_with_group, :role => "operator", :settings => {})
  end

  it '#x_get_tree_arch_orph_nodes' do
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

  it '#x_get_tree_custom_kids with hidden Infra VMs returns empty Array' do
    User.current_user.settings[:display] = {:display_vms => false}
    nodes_orph = archived.x_get_tree_custom_kids({:id => 'orph'},
                                                 false,
                                                 :leaf => 'ManageIQ::Providers::InfraManager::VmOrTemplate')
    nodes_arch = archived.x_get_tree_custom_kids({:id => 'arch'},
                                                 false,
                                                 :leaf => 'ManageIQ::Providers::InfraManager::VmOrTemplate')
    expect(nodes_orph).to eq([])
    expect(nodes_arch).to eq([])
  end

  it '#x_get_tree_custom_kids with Infra VMs/Templates returns VMs' do
    User.current_user.settings[:display] = {:display_vms => true}
    vm_orph = FactoryBot.create(:vm_infra, :storage => FactoryBot.create(:storage))
    template_orph = FactoryBot.create(:template_infra, :storage => FactoryBot.create(:storage))
    vm_arch = FactoryBot.create(:vm_infra)
    template_arch = FactoryBot.create(:template_infra)
    allow(ManageIQ::Providers::InfraManager::VmOrTemplate).to receive(:orphaned) { [vm_orph, template_orph] }
    allow(ManageIQ::Providers::InfraManager::VmOrTemplate).to receive(:archived) { [vm_arch, template_arch] }
    nodes_orph = archived.x_get_tree_custom_kids({:id => 'orph'},
                                                 false,
                                                 :leaf => 'ManageIQ::Providers::InfraManager::VmOrTemplate')
    nodes_arch = archived.x_get_tree_custom_kids({:id => 'arch'},
                                                 false,
                                                 :leaf => 'ManageIQ::Providers::InfraManager::VmOrTemplate')
    expect(nodes_orph).to eq([vm_orph, template_orph].sort_by { |object| object[:name] })
    expect(nodes_arch).to eq([vm_arch, template_arch].sort_by { |object| object[:name] })
  end

  it '#x_get_tree_custom_kids with hidden Cloud VMs returns empty Array' do
    User.current_user.settings[:display] = {:display_vms => false}
    nodes_orph = archived.x_get_tree_custom_kids({:id => 'orph'},
                                                 false,
                                                 :leaf => 'VmCloud')
    nodes_arch = archived.x_get_tree_custom_kids({:id => 'arch'},
                                                 false,
                                                 :leaf => 'VmCloud')
    expect(nodes_orph).to eq([])
    expect(nodes_arch).to eq([])
  end

  it '#x_get_tree_custom_kids with Cloud VMs returns VMs' do
    User.current_user.settings[:display] = {:display_vms => true}
    vm_arch_cloud = FactoryBot.create(:vm_cloud)
    vm_orph_cloud = FactoryBot.create(:vm_cloud, :storage => FactoryBot.create(:storage))
    nodes_orph = archived.x_get_tree_custom_kids({:id => 'orph'},
                                                 false,
                                                 :leaf => 'VmCloud')
    nodes_arch = archived.x_get_tree_custom_kids({:id => 'arch'},
                                                 false,
                                                 :leaf => 'VmCloud')
    expect(nodes_orph).to eq([vm_orph_cloud])
    expect(nodes_arch).to eq([vm_arch_cloud])
  end

  it '#x_get_tree_custom_kids with hidden Cloud Templates returns empty Array' do
    User.current_user.settings[:display] = {:display_vms => false}
    nodes_orph = archived.x_get_tree_custom_kids({:id => 'orph'},
                                                 false,
                                                 :leaf => 'ManageIQ::Providers::CloudManager::Template')
    nodes_arch = archived.x_get_tree_custom_kids({:id => 'arch'},
                                                 false,
                                                 :leaf => 'ManageIQ::Providers::InfraManager::Template')
    expect(nodes_orph).to eq([])
    expect(nodes_arch).to eq([])
  end

  it '#x_get_tree_custom_kids with Cloud Templates returns Templates' do
    User.current_user.settings[:display] = {:display_vms => true}
    template_arch_cloud = FactoryBot.create(:template_cloud)
    template_orph_cloud = FactoryBot.create(:template_cloud, :storage => FactoryBot.create(:storage))
    nodes_orph = archived.x_get_tree_custom_kids({:id => 'orph'},
                                                 false,
                                                 :leaf => 'ManageIQ::Providers::CloudManager::Template')
    nodes_arch = archived.x_get_tree_custom_kids({:id => 'arch'},
                                                 false,
                                                 :leaf => 'ManageIQ::Providers::CloudManager::Template')
    expect(nodes_orph).to eq([template_orph_cloud])
    expect(nodes_arch).to eq([template_arch_cloud])
  end
end
