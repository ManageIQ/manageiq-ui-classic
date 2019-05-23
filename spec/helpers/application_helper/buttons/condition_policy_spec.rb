describe ApplicationHelper::Button::ConditionPolicy do
  describe "#role_allows_feature?" do
    let(:session) { {} }
    before do
      sandbox = {:active_tree => :policy_tree}
      @view_context = setup_view_context_with_sandbox(sandbox)
      @button = described_class.new(@view_context, {}, {}, {:child_id => "condition_remove"})
    end

    it "will be skipped" do
      login_as FactoryBot.create(:user)
      expect(@button.role_allows_feature?).to be false
    end

    it "won't be skipped", :type => :helper do
      login_as FactoryBot.create(:user, :features => "condition_remove")
      expect(@button.role_allows_feature?).to be true
    end
  end
end
