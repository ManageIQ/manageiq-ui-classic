describe TreeBuilderAeClass do
  include Spec::Support::AutomationHelper

  context "initialize" do
    before do
      user = FactoryBot.create(:user_with_group)
      login_as user
      create_state_ae_model(:name => 'LUIGI', :ae_class => 'CLASS1', :ae_namespace => 'A/B/C')
      create_ae_model(:name => 'MARIO', :ae_class => 'CLASS3', :ae_namespace => 'C/D/E')
      @sb = {:trees => {:ot_tree => {:open_nodes => []}}, :active_tree => :ot_tree}
    end

    it "a tree without filter" do
      tree = TreeBuilderAeClass.new(:automate_tree, @sb)
      domains = JSON.parse(tree.tree_nodes).first['nodes'].collect { |h| h['text'] }
      expect(domains).to include("LUIGI", "MARIO")
    end
  end

  context "#x_get_tree_roots" do
    before do
      user = FactoryBot.create(:user_with_group)
      login_as user
      tenant1 = user.current_tenant
      tenant2 = FactoryBot.create(:tenant, :parent => tenant1)
      FactoryBot.create(:miq_ae_domain, :name => "test1", :tenant => tenant1)
      FactoryBot.create(:miq_ae_domain, :name => "test2", :tenant => tenant2)
    end

    it "should only return domains in a user's current tenant" do
      tree = TreeBuilderAeClass.new("ae_tree", {})
      domains = JSON.parse(tree.tree_nodes).first['nodes'].collect { |h| h['text'] }
      expect(domains).to include("test1")
      expect(domains).not_to include("test2")
    end
  end

  context "#x_get_tree_roots" do
    before do
      user = FactoryBot.create(:user_with_group)
      login_as user
      tenant1 = user.current_tenant
      FactoryBot.create(:miq_ae_domain, :name => "test1", :tenant => tenant1, :priority => 1)
      FactoryBot.create(:miq_ae_domain, :name => "test2", :tenant => tenant1, :priority => 2)
    end

    it "should return domains in correct order" do
      tree = TreeBuilderAeClass.new("ae_tree", {})
      domains = JSON.parse(tree.tree_nodes).first['nodes'].collect { |h| h['text'] }
      expect(domains).to eq(["test2", "test1", "ManageIQ (Locked)"])
    end
  end
end
