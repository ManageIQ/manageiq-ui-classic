describe TreeBuilderReportReports do
  describe "#initialize" do
    let(:role) { MiqUserRole.find_by(:name => "EvmRole-operator") }
    let(:tenant) { FactoryBot.create(:tenant) }
    let(:group) { FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Test Group", :tenant => tenant) }

    before { login_as FactoryBot.create(:user, :userid => 'wilma', :miq_groups => [group]) }

    subject { described_class.new(:roles_tree, {}, false) }

    it "sets the group title correctly" do
      expect(subject.instance_variable_get(:@grp_title)).to include("Test Group")
    end
  end
end
