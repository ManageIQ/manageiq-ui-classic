describe TreeBuilderOpsRbac do
  before do
    MiqRegion.seed
    EvmSpecHelper.local_miq_server
  end

  describe ".new" do
    def assert_tree_nodes(expected)
      tree_json  = TreeBuilderOpsRbac.new("rbac_tree", "rbac", {}).tree_nodes
      tree_nodes = JSON.parse(tree_json).first['nodes'].collect { |h| h['text'] }
      expect(tree_nodes).to match_array expected
    end

    it "with user with rbac_group role" do
      login_as FactoryBot.create(:user, :features => 'rbac_group_view')
      assert_tree_nodes(["Groups"])
    end

    it "has :open_all set to false" do
      login_as FactoryBot.create(:user, :features => 'none')
      tree = TreeBuilderOpsRbac.new("rbac_tree", "rbac", {})
      expect(tree.send(:tree_init_options)[:open_all]).to be_falsey
    end

    it "with user with rbac_role_view role" do
      login_as FactoryBot.create(:user, :features => 'rbac_role_view')
      assert_tree_nodes(["Roles"])
    end

    it "with user with rbac_tenant role" do
      login_as FactoryBot.create(:user, :features => 'rbac_tenant_view')
      assert_tree_nodes(["Tenants"])
    end

    it "with user with rbac_user role" do
      login_as FactoryBot.create(:user, :features => 'rbac_user_view')
      assert_tree_nodes(["Users"])
    end

    it "with user with multiple rbac roles" do
      login_as FactoryBot.create(:user,
                                  :features => %w(rbac_group_view rbac_user_view rbac_role_view rbac_tenant_view))
      assert_tree_nodes(%w(Groups Users Roles Tenants))
    end
  end

  describe "#x_get_tree_custom_kids" do
    let(:group) { FactoryBot.create(:miq_group, :features => "none") }
    let(:user) { FactoryBot.create(:user, :miq_groups => [group, other_group]) }
    let(:other_group) { FactoryBot.create(:miq_group) }
    let(:other_user) { FactoryBot.create(:user, :miq_groups => [other_group]) }

    before do
      login_as user
    end

    def x_get_tree_custom_kids_for_and_expect_objects(type_of_model, expected_objects)
      tree_builder = TreeBuilderOpsRbac.new("rbac_tree", "rbac", {})
      objects = tree_builder.send(:x_get_tree_custom_kids, {:id => type_of_model}, false, {})
      expect(objects).to match_array(expected_objects)
    end

    it "is listing all users from current user's groups" do
      x_get_tree_custom_kids_for_and_expect_objects("u", [user, other_user])
    end

    it "is listing all groups" do
      x_get_tree_custom_kids_for_and_expect_objects("g", [user.current_group, other_group])
    end

    context "User with self service user" do
      let(:self_service_role) { FactoryBot.create(:miq_user_role, :settings => {:restrictions => {:vms => :user}}) }
      let(:group)             { FactoryBot.create(:miq_group, :miq_user_role => self_service_role) }
      let(:other_group)       { FactoryBot.create(:miq_group, :miq_user_role => self_service_role) }
      let(:user)              { FactoryBot.create(:user, :miq_groups => [group, other_group], :role => 'user_self_service') }

      it "is listing only current user" do
        x_get_tree_custom_kids_for_and_expect_objects("u", [user])
      end

      it "is listing only user's group" do
        x_get_tree_custom_kids_for_and_expect_objects("g", [user.current_group])
      end
    end
  end
end
