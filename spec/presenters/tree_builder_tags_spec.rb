describe TreeBuilderTags do
  before do
    role = MiqUserRole.find_by(:name => "EvmRole-operator")
    @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Tags Group")
    login_as FactoryBot.create(:user, :userid => 'tags_wilma', :miq_groups => [@group])
    @tag_selected = FactoryBot.create(:classification, :name => 'tag_selected', :show => false)
    @folder_selected = FactoryBot.create(:classification, :name => 'folder_selected', :show => true)
    @folder_selected.entries.push(@tag_selected)
    @tag_not_selected = FactoryBot.create(:classification, :name => 'tag_not_selected', :show => false)
    @folder_not_selected = FactoryBot.create(:classification, :name => 'folder_not_selected', :show => true)
    @folder_not_selected.entries.push(@tag_not_selected)
    @filters = {"#{@folder_selected.name}-#{@tag_selected.name}" =>
                                                                    "/managed/#{@folder_selected.name}/#{@tag_selected.name}"}
    @group = FactoryBot.create(:miq_group)
  end
  context 'read-only mode' do
    before do
      edit = nil
      @tags_tree = TreeBuilderTags.new(:tag,
                                       :tag_tree,
                                       {},
                                       true,
                                       :edit => edit, :filters => @filters, :group => @group)
    end
    it 'set init options correctly' do
      tree_options = @tags_tree.send(:tree_init_options)
      expect(tree_options).to eq(
        :full_ids   => true,
        :checkboxes => true,
        :check_url  => "/ops/rbac_group_field_changed/#{@group.id}___",
        :oncheck    => nil
      )
    end
    it 'set locals for render correctly' do
      locals = @tags_tree.send(:set_locals_for_render)
      expect(locals[:checkboxes]).to eq(true)
      expect(locals[:check_url]).to eq("/ops/rbac_group_field_changed/#{@group.id}___")
      expect(locals[:oncheck]).to eq(nil)
    end
    it 'set info about selected kids correctly' do
      expect(@tags_tree.send(:contain_selected_kid, @folder_selected)).to eq(true)
      expect(@tags_tree.send(:contain_selected_kid, @folder_not_selected)).to eq(false)
    end
    it 'sets root to nothing' do
      expect { @tags_tree.send(:root_options) }.to raise_error(NoMethodError)
    end
    it 'sets first level nodes correctly' do
      roots = @tags_tree.send(:x_get_tree_roots, false, nil)
      expect(roots).to eq([@folder_selected, @folder_not_selected].sort_by! { |c| c.description.downcase })
    end
    it 'sets second level nodes correctly' do
      selected_kid = @tags_tree.send(:x_get_classification_kids, @folder_selected, false)
      not_selected_kid = @tags_tree.send(:x_get_classification_kids, @folder_not_selected, false)
      expect(selected_kid).to eq([{:id         => @tag_selected.id,
                                   :icon       => "fa fa-tag",
                                   :text       => @tag_selected.description,
                                   :checkable  => @edit.present?,
                                   :tooltip    => "Tag: #{@tag_selected.description}",
                                   :selectable => false,
                                   :select     => true}])
      expect(not_selected_kid).to eq([{:id         => @tag_not_selected.id,
                                       :icon       => "fa fa-tag",
                                       :text       => @tag_not_selected.description,
                                       :checkable  => @edit.present?,
                                       :tooltip    => "Tag: #{@tag_not_selected.description}",
                                       :selectable => false,
                                       :select     => false}])
    end
  end
  context "edit mode" do
    before do
      @edit = {:new => {:filters => {}}}
      @tags_tree = TreeBuilderTags.new(:tag,
                                       :tag_tree,
                                       {},
                                       true,
                                       :edit => @edit, :filters => @filters, :group => nil)
    end
    it 'set locals for render correctly' do
      locals = @tags_tree.send(:set_locals_for_render)
      expect(locals[:checkboxes]).to eq(true)
      expect(locals[:check_url]).to eq("/ops/rbac_group_field_changed/new___")
      expect(locals[:oncheck]).to eq("miqOnCheckUserFilters")
    end
    it 'sets second level nodes correctly' do
      selected_kid = @tags_tree.send(:x_get_classification_kids, @folder_selected, false)
      not_selected_kid = @tags_tree.send(:x_get_classification_kids, @folder_not_selected, false)

      expect(selected_kid).to eq([{:id         => @tag_selected.id,
                                   :icon       => "fa fa-tag",
                                   :text       => @tag_selected.description,
                                   :checkable  => @edit.present?,
                                   :tooltip    => "Tag: #{@tag_selected.description}",
                                   :selectable => false,
                                   :select     => true}])
      expect(not_selected_kid).to eq([{:id         => @tag_not_selected.id,
                                       :icon       => "fa fa-tag",
                                       :text       => @tag_not_selected.description,
                                       :checkable  => @edit.present?,
                                       :tooltip    => "Tag: #{@tag_not_selected.description}",
                                       :selectable => false,
                                       :select     => false}])
    end
  end
end
