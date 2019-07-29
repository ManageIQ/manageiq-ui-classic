describe TreeBuilderReportRoles do
  context "#x_get_tree_roots" do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Test Group")
      login_as FactoryBot.create(:user, :userid => 'wilma', :miq_groups => [@group])
    end

    it "gets roles/group for the specified user" do
      tree = TreeBuilderReportRoles.new("roles_tree", {})
      roles = tree.tree_nodes.first[:nodes].collect { |h| h[:text] }
      expect(roles).to eq([@group.description])
    end
  end
end
