describe TreeBuilderMiqActionCategory do
  before do
    role = MiqUserRole.find_by(:name => "EvmRole-operator")
    group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Tags Group")
    login_as FactoryBot.create(:user, :userid => 'tags_wilma', :miq_groups => [group])
  end

  let!(:tag1) { FactoryBot.create(:classification, :name => 'tag1', :show => false) }
  let!(:folder1) do
    f1 = FactoryBot.create(:classification, :name => 'folder1', :show => true)
    f1.entries.push(tag1)
    f1
  end
  let!(:tag2) { FactoryBot.create(:classification, :name => 'tag2', :show => false) }
  let!(:folder2) do
    f2 = FactoryBot.create(:classification, :name => 'folder2', :show => true)
    f2.entries.push(tag2)
    f2
  end
  let!(:tenant) { "TestTenant Tags" }
  let!(:tree_name) { :action_tags }

  subject do
    described_class.new(:action_tags_tree, :action_tags, {}, true, :root => tenant)
  end

  describe '#tree_init_options' do
    it 'set init options correctly' do
      expect(subject.send(:tree_init_options)[:lazy]).not_to be_truthy
    end
  end

  describe '#set_locals_for_render' do
    it 'set locals for render correctly' do
      locals = subject.send(:set_locals_for_render)
      expect(locals[:click_url]).to eq("/miq_policy/action_tag_pressed/")
      expect(locals[:onclick]).to eq("miqOnClickGeneric")
    end
  end

  describe '#override' do
    it 'set node' do
      node = subject.send(:override, {}, tag1, nil, nil)
      expect(node[:selectable]).to eq(true)

      node = subject.send(:override, {}, folder1, nil, nil)
      expect(node[:selectable]).to eq(false)
    end
  end

  describe '#root_options' do
    it 'sets root_options correctly' do
      expect(subject.send(:root_options)).to eq(
        :text    => tenant,
        :tooltip => tenant,
        :icon    => "fa fa-tag"
      )
    end
  end

  describe '#x_get_tree_roots' do
    it 'sets first level nodes correctly' do
      s = subject.send(:x_get_tree_roots, false, nil)
      expect(s).to eq([folder1, folder2].sort_by { |c| c.description.downcase })
    end
  end

  describe '#x_get_tree_classification_kids' do
    it 'sets second level nodes correctly' do
      kid1 = subject.send(:x_get_tree_classification_kids, folder1, false)
      kid2 = subject.send(:x_get_tree_classification_kids, folder2, false)

      expect(kid1[0].id).to eq(tag1.id)
      expect(kid1[0].description).to eq(tag1.description)
      expect(kid1[0].parent_id).to eq(folder1.id)

      expect(kid2[0].id).to eq(tag2.id)
      expect(kid2[0].description).to eq(tag2.description)
      expect(kid2[0].parent_id).to eq(folder2.id)
    end
  end
end
