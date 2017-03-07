describe TreeBuilderAlertProfileObj do
  before do
    role = MiqUserRole.find_by(:name => "EvmRole-operator")
    group = FactoryGirl.create(:miq_group, :miq_user_role => role, :description => "Tags Group")
    login_as FactoryGirl.create(:user, :userid => 'tags_wilma', :miq_groups => [group])
  end

  let!(:tag1a) { FactoryGirl.create(:classification, :name => 'tag1a') }
  let!(:tag2a) { FactoryGirl.create(:classification, :name => 'tag2a') }
  let!(:tag3a) { FactoryGirl.create(:classification, :name => 'tag3a') }
  let!(:folder1a) do
    f1 = FactoryGirl.create(:classification, :name => 'folder1a', :show => true)
    f1.entries.push(tag1a)
    f1.entries.push(tag2a)
    f1.entries.push(tag3a)
    f1
  end
  let!(:tag1b) { FactoryGirl.create(:tenant, :name => 'tag1b') }
  let!(:tag2b) { FactoryGirl.create(:tenant, :name => 'tag2b') }
  let!(:tag3b) { FactoryGirl.create(:tenant, :name => 'tag3b') }
  let!(:tree_name) { :alert_profile_obj }

  context 'classification tree' do
    subject do
      described_class.new(:alert_profile_obj_tree, :alert_profile_obj,
                          {},
                          true,
                          'storage-tags',
                          folder1a.id,
                          [tag1a.id, tag2a.id])
    end

    describe '#tree_init_options' do
      it 'set init options correctly' do
        expect(subject.send(:tree_init_options, tree_name)).to eq(:expand => true)
      end
    end

    describe '#set_locals_for_render' do
      it 'set locals for render correctly' do
        locals = subject.send(:set_locals_for_render)
        expect(locals[:id_prefix]).to eq('obj_treebox2')
        expect(locals[:check_url]).to eq("alert_profile_assign_changed/")
        expect(locals[:oncheck]).to eq("miqOnCheckHandler")
        expect(locals[:checkboxes]).to eq(true)
        expect(locals[:cfmeNoClick]).to eq(true)
        expect(locals[:onclick]).to eq(false)
      end
    end

    describe '#override' do
      it 'set node' do
        node = subject.send(:override, {}, tag1a, nil, nil)
        expect(node[:hideCheckbox]).to eq(false)
        expect(node[:select]).to eq(true)

        node = subject.send(:override, {}, tag2a, nil, nil)
        expect(node[:select]).to eq(true)

        node = subject.send(:override, {}, tag3a, nil, nil)
        expect(node[:select]).to eq(false)
      end
    end

    describe '#root_options' do
      it 'sets root_options correctly' do
        assign_to = 'storage-tags'
        t = assign_to.ends_with?("-tags") ? "Tags" : ui_lookup(:tables => assign_to)
        opt = {
          :title        => t,
          :tooltip      => "",
          :icon         => "pficon pficon-folder-open",
          :hideCheckbox => true,
          :cfmeNoClick  => true,
          :expand       => true
        }
        expect(subject.send(:root_options)).to eq(opt)
      end
    end

    describe '#x_get_tree_roots' do
      it 'sets first level nodes correctly' do
        s = subject.send(:x_get_tree_roots, false, nil)
        expect(s).to eq([tag1a, tag2a, tag3a].sort_by { |o| (o.name.presence || o.description).downcase })
      end
    end
  end

  context 'tenant tree' do
    subject do
      described_class.new(:alert_profile_obj_tree,
                          :alert_profile_obj,
                          {},
                          true,
                          'tenant',
                          nil,
                          [tag1b.id])
    end

    describe '#x_get_tree_roots' do
      it 'sets first level nodes correctly' do
        s = subject.send(:x_get_tree_roots, false, nil)
        expect(s).to eq(Tenant.all.sort_by { |o| (o.name.presence || o.description).downcase })
      end
    end

    describe '#override' do
      it 'set node' do
        node = subject.send(:override, {}, tag1b, nil, nil)
        expect(node[:hideCheckbox]).to eq(false)
        expect(node[:select]).to eq(true)

        node = subject.send(:override, {}, tag2b, nil, nil)
        expect(node[:select]).to eq(false)

        node = subject.send(:override, {}, tag3b, nil, nil)
        expect(node[:select]).to eq(false)
      end
    end
  end
end
