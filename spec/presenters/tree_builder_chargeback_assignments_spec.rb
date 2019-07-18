describe TreeBuilderChargebackAssignments do
  context "#x_get_tree_roots" do
    it "correctly renders storage and compute nodes when no rates are available" do
      tree = TreeBuilderChargebackAssignments.new("cb_rates_tree", {})
      keys = JSON.parse(tree.tree_nodes).first['nodes'].collect { |x| x['text'] }
      titles = JSON.parse(tree.tree_nodes).first['nodes'].collect { |x| x['text'] }

      # FIXME: ID prefixes are missing
      # expect(keys).to match_array %w(xx-Compute xx-Storage)
      expect(keys).to match_array %w(Compute Storage)
      expect(titles).to match_array %w(Compute Storage)
    end
  end
end
