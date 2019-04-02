describe TreeBuilderVmsAndTemplates do
  let(:ems) { FactoryBot.create(:ems_vmware, :zone => FactoryBot.create(:zone)) }
  let(:folder) { FactoryBot.create(:ems_folder, :ext_management_system => ems) }
  let(:subfolder1) { FactoryBot.create(:ems_folder) }

  let(:tree) do
    subfolder2 = FactoryBot.create(:ems_folder)
    subfolder3 = FactoryBot.create(:datacenter)

    ems.with_relationship_type("ems_metadata") { ems.add_child(folder) }
    folder.with_relationship_type("ems_metadata") { folder.add_child(subfolder1) }
    folder.with_relationship_type("ems_metadata") { folder.add_child(subfolder2) }
    folder.with_relationship_type("ems_metadata") { folder.add_child(subfolder3) }

    {ems => {folder => {subfolder1 => {}, subfolder2 => {}, subfolder3 => {}}}}
  end

  describe "#sort_tree" do
    it "making sure sort_tree was successful for mixed ems_folder types" do
      builder = TreeBuilderVmsAndTemplates.new(ems)
      expect { builder.send(:sort_tree, tree) }.not_to raise_error
    end
  end

  describe "#tree" do
    it "returns no vms with display_vms=false" do
      EvmSpecHelper.local_miq_server
      tree
      vms = FactoryBot.create_list(:vm_vmware, 2, :ext_management_system => ems)
      subfolder1.with_relationship_type("ems_metadata") { vms.each { |vm| subfolder1.add_child(vm) } }

      tree_v = TreeBuilderVmsAndTemplates.new(ems).tree
      expect(tree_v[:text]).to eq(ems.name)
      expect(tree_v[:nodes].size).to eq(1)

      folders_v = tree_v[:nodes].first
      expect(folders_v[:text]).to match folder.name
      expect(folders_v[:nodes].size).to eq(1) # would be 3 if we did not prune

      subfolders_v = folders_v[:nodes].detect { |f| f[:text] == subfolder1.name }
      expect(subfolders_v).to be_present
      expect(subfolders_v[:nodes]).to be_blank # no vms in the tree
    end
  end
end
