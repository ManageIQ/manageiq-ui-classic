describe TreeBuilderAlertProfileObj do
  before do
    role = MiqUserRole.find_by(:name => "EvmRole-operator")
    group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Tags Group")
    login_as FactoryBot.create(:user, :userid => 'tags_wilma', :miq_groups => [group])
  end
  let(:tag1a) { FactoryBot.create(:classification, :name => 'tag1a') }
  let(:tag2a) { FactoryBot.create(:classification, :name => 'tag2a') }
  let(:tag3a) { FactoryBot.create(:classification, :name => 'tag3a') }
  let(:folder1a) do
    f1 = FactoryBot.create(:classification, :name => 'folder1a', :show => true)
    f1.entries.push(tag1a)
    f1.entries.push(tag2a)
    f1.entries.push(tag3a)
    f1
  end
  let!(:tag1b) { FactoryBot.create(:tenant, :name => 'tag1b') }
  let!(:tag2b) { FactoryBot.create(:tenant, :name => 'tag2b') }
  let!(:tag3b) { FactoryBot.create(:tenant, :name => 'tag3b') }

  context 'classification tree' do
    subject do
      described_class.new(:alert_profile_obj_tree,
                          {},
                          true,
                          :assign_to      => 'storage-tags',
                          :cat            => folder1a.id,
                          :selected_nodes => [tag1a.id, tag2a.id])
    end

    describe '#tree_init_options' do
      it 'sets init options correctly' do
        expect(subject.send(:tree_init_options)).to eq(
          :checkboxes => true,
          :oncheck    => "miqOnCheckGeneric",
          :check_url  => "/miq_policy/alert_profile_assign_changed/"
        )
      end
    end

    describe '#set_locals_for_render' do
      it 'sets locals for render correctly' do
        locals = subject.send(:set_locals_for_render)
        expect(locals[:check_url]).to eq("/miq_policy/alert_profile_assign_changed/")
        expect(locals[:oncheck]).to eq("miqOnCheckGeneric")
        expect(locals[:checkboxes]).to be_truthy
        expect(locals[:selectable]).to be_falsey
        expect(locals[:onclick]).to be_falsey
      end
    end

    describe '#override' do
      let(:node) { {} }

      it 'sets node1' do
        subject.send(:override, node, tag1a)
        expect(node[:hideCheckbox]).to be_falsey
        expect(node[:select]).to be_truthy
      end
      it 'sets node2' do
        subject.send(:override, node, tag2a)
        expect(node[:select]).to be_truthy
      end
      it 'sets node3' do
        subject.send(:override, node, tag3a)
        expect(node[:select]).to be_falsey
      end
    end

    describe '#root_options' do
      it 'sets root_options correctly' do
        res = subject.send(:root_options)
        expect(res[:text]).to eq("Tags")
        expect(res[:tooltip]).to eq("")
        expect(res[:icon]).to eq("pficon pficon-folder-open")
        expect(res[:hideCheckbox]).to be_truthy
        expect(res[:selectable]).to be_falsey
        expect(res[:expand]).to be_truthy
      end
    end

    describe '#x_get_tree_roots' do
      it 'sets first level nodes correctly' do
        s = subject.send(:x_get_tree_roots, false)
        expect(s).to eq([tag1a, tag2a, tag3a].sort_by { |o| (o.name.presence || o.description).downcase })
      end
    end

    describe '#x_get_tree_roots for provider' do
      it 'returns all ExtManagementSystems except the Embedded Ansible when @assign_to=ext_management_system' do
        subject.instance_variable_set(:@cat_tree, nil)
        subject.instance_variable_set(:@assign_to, "ext_management_system")
        expect(subject.send(:x_get_tree_roots, false)).to eq(ExtManagementSystem.where.not(:type => "ManageIQ::Providers::EmbeddedAnsible::AutomationManager"))
      end
    end
  end

  context 'tenant tree' do
    subject do
      described_class.new(:alert_profile_obj_tree,
                          {},
                          true,
                          :assign_to      => 'tenant',
                          :cat            => nil,
                          :selected_nodes => [tag1b.id])
    end

    describe '#x_get_tree_roots' do
      it 'sets first level nodes correctly' do
        s = subject.send(:x_get_tree_roots, false)
        expect(s).to eq(Tenant.all.sort_by { |o| (o.name.presence || o.description).downcase })
      end
    end
  end
end
