describe TreeBuilderAlertProfileObj do
  before do
    role = MiqUserRole.find_by_name("EvmRole-operator")
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

  subject do
    @assign = {}
    @assign[:new] = {}
    @assign[:new][:assign_to] = 'storage-tags'
    @assign[:new][:cat] = folder1a.id
    @assign[:new][:objects] = [tag1a.id, tag2a.id]
    described_class.new(:alert_profile_obj_tree, :alert_profile_obj, {}, true, @assign)
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
    end
  end

  describe '#override' do
    it 'set node' do
      binding.pry
      node = subject.send(:override, {}, tag1a, nil, nil)
      expect(node[:cfmeNoClick]).to eq(true)
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
      #expect(subject.send(:root_options)).to eq([tenant, tenant, "100/folder_open])
    end
  end

  describe '#x_get_tree_roots' do
    it 'sets first level nodes correctly' do
      s = subject.send(:x_get_tree_roots, false, nil)
      expect(s).to eq([tag1a, tag2a, tag3a].sort_by { |o| (o.name.presence || o.description).downcase } )
    end
  end

=begin
  subject do
    @assign = {}
    @assign[:new] = {}
    @assign[:new][:assign_to] = 'tenant'
    @assign[:new][:objects] = [tag1b.id]
    described_class.new(:alert_profile_obj_tree, :alert_profile_obj, {}, true, @assign)
  end

  describe '#x_get_tree_roots' do
    it 'sets first level nodes correctly' do
      binding.pry
      s = subject.send(:x_get_tree_roots, false, nil)
      expect(s).to eq([tag1b, tag2b, tag3b].sort_by { |o| (o.name.presence || o.description).downcase } )
    end
  end

  describe '#override' do
    it 'set node' do
      node = subject.send(:override, {}, tag1b, nil, nil)
      expect(node[:cfmeNoClick]).to eq(true)
      expect(node[:hideCheckbox]).to eq(false)
      expect(node[:select]).to eq(true)

      node = subject.send(:override, {}, tag2b, nil, nil)
      expect(node[:select]).to eq(false)

      node = subject.send(:override, {}, tag3b, nil, nil)
      expect(node[:select]).to eq(false)
    end
  end
=end

end
