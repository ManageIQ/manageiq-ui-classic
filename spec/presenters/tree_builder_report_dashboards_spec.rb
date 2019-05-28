describe TreeBuilderReportDashboards do
  before do
    allow(User).to receive_messages(:server_timezone => "UTC")
    login_as user
  end

  let(:group)            { FactoryBot.create(:miq_group) }
  let(:user)             { FactoryBot.create(:user, :miq_groups => [group]) }
  let!(:other_group)     { FactoryBot.create(:miq_group) }
  let!(:miq_widget_set) do
    widget_set_params = {:read_only => true, :owner_id => group.id, :owner_type => "MiqGroup"}
    FactoryBot.create(:miq_widget_set, widget_set_params)
  end

  describe "#x_get_tree_g_kids" do
    it "is listing widget sets for certain group" do
      tree_builder = TreeBuilderReportDashboards.new("rbac_tree", {})
      objects = tree_builder.send(:x_get_tree_g_kids, group, false)
      expect(objects).to match_array([miq_widget_set])
    end
  end

  describe "#x_get_tree_custom_kids" do
    it "is listing only user's groups, logged is self service user" do
      allow_any_instance_of(MiqGroup).to receive_messages(:self_service? => true)
      tree_builder = TreeBuilderReportDashboards.new("rbac_tree", {})
      objects = tree_builder.send(:x_get_tree_custom_kids, {:id => "g"}, false, :type => :db)
      expect(objects).to match_array([group])
    end
  end
end
