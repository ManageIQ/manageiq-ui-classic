describe TreeBuilderAeClass do
  include Spec::Support::AutomationHelper

  describe "#initialize" do
    before do
      user = FactoryBot.create(:user_with_group)
      login_as user
      create_state_ae_model(:name => 'LUIGI', :ae_class => 'CLASS1', :ae_namespace => 'A/B/C')
      create_ae_model(:name => 'MARIO', :ae_class => 'CLASS3', :ae_namespace => 'C/D/E')
      @sb = {:trees => {:ot_tree => {:open_nodes => []}}, :active_tree => :ot_tree}
    end

    it "a tree with filter" do
      @sb[:cached_waypoint_ids] = MiqAeClass.waypoint_ids_for_state_machines
      tree = TreeBuilderAutomate.new(:automate_tree, "automate", @sb)
      domains = JSON.parse(tree.tree_nodes).first['nodes'].collect { |h| h['text'] }
      expect(domains).to match_array ['LUIGI']
    end

    it "a tree without filter" do
      tree = TreeBuilderAutomate.new(:automate_tree, "automate", @sb)
      domains = JSON.parse(tree.tree_nodes).first['nodes'].collect { |h| h['text'] }
      expect(domains).to match_array %w(LUIGI MARIO)
    end
  end
end
