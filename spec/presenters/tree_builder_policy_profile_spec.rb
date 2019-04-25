describe TreeBuilderPolicyProfile do
  context '#tree_init_options' do
    it "is explicitly not lazy" do
      tree = TreeBuilderPolicyProfile.new(:policy_profile_tree, {}, true)
      options = tree.instance_variable_get(:@options)
      expect(options[:lazy]).not_to be_truthy
    end
  end
end
