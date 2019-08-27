describe TreeBuilderSections do
  context 'TreeBuilderSections' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "All sections")
      login_as FactoryBot.create(:user, :userid => 'all_sections_wilma', :miq_groups => [@group])
      @controller_name = 'controller_name'
      @current_tenant = 'Current tenant name'
      first_vm = FactoryBot.create(:vm)
      second_vm = FactoryBot.create(:vm)
      report = FactoryBot.create(:miq_report_filesystem)
      @compare = FactoryBot.build(:miq_compare,
                                   :report  => report,
                                   :options => {:ids     => [first_vm, second_vm],
                                                :include => {:hardware            => {:fetch   => false,
                                                                                      :fetched => false,
                                                                                      :checked => false,
                                                                                      :group   => "Properties"},
                                                             :_model_             => {:fetch   => true,
                                                                                      :fetched => false,
                                                                                      :checked => true,
                                                                                      :group   => "Properties"},
                                                             :"hardware.disks"    => {:fetch   => false,
                                                                                      :fetched => false,
                                                                                      :checked => false,
                                                                                      :key     => "",
                                                                                      :group   => "Properties"},
                                                             :"hardware.cdroms"   => {:fetch   => false,
                                                                                      :fetched => false,
                                                                                      :checked => false,
                                                                                      :key     => "",
                                                                                      :group   => "Properties"},
                                                             :"hardware.floppies" => {:fetch   => false,
                                                                                      :fetched => false,
                                                                                      :checked => false,
                                                                                      :key     => "",
                                                                                      :group   => "Properties"},
                                                             :"hardware.nics"     => {:fetch   => false,
                                                                                      :fetched => false,
                                                                                      :checked => false,
                                                                                      :key     => "",
                                                                                      :group   => "Properties"},
                                                             :"hardware.volumes"  => {:fetch   => false,
                                                                                      :fetched => false,
                                                                                      :checked => false,
                                                                                      :key     => :name,
                                                                                      :group   => "Properties"}}})
      @sections_tree = TreeBuilderSections.new(:all_sections_tree,
                                               {},
                                               true,
                                               :data            => @compare,
                                               :controller_name => @controller_name,
                                               :current_tenant  => @current_tenant)
    end
    it 'set init options correctly' do
      tree_options = @sections_tree.send(:tree_init_options)
      expect(tree_options).to eq(
        :full_ids     => true,
        :checkboxes   => true,
        :three_checks => true,
        :oncheck      => "miqOnCheckSections",
        :check_url    => "/controller_name/sections_field_changed/"
      )
    end
    it 'set locals for render correctly' do
      locals = @sections_tree.send(:set_locals_for_render)
      expect(locals[:check_url]).to eq("/#{@controller_name}/sections_field_changed/")
      expect(locals[:oncheck]).to eq("miqOnCheckSections")
      expect(locals[:three_checks]).to eq(true)
    end
    it 'sets roots correctly' do
      roots = @sections_tree.send(:x_get_tree_roots, false)
      expect(roots).to eq([{:id         => "group_Properties",
                            :text       => "Properties",
                            :tip        => "Properties",
                            :image      => false,
                            :checked    => true,
                            :selectable => false,
                            :nodes      => [{:name => :_model_, :header => "Filesystem", :group => "Properties"}]}])
    end

    it 'sets children correctly' do
      root = @sections_tree.send(:x_get_tree_roots, false).first
      kids = @sections_tree.send(:x_get_tree_hash_kids, root, false)
      expect(kids).to eq([{:id         => "group_Properties:_model_",
                           :text       => "Filesystem",
                           :tip        => "Filesystem",
                           :image      => false,
                           :selectable => false,
                           :checked    => true,
                           :nodes      => []}])
    end
  end
end
