describe SecurityGroupHelper::TextualSummary do
  describe ".textual_group_firewall" do
    before do
      login_as FactoryGirl.create(:user)
    end

    subject { textuclal_group_firewall }
    it 'returns TextualTable struct with list of of firewall rules' do
      firewall_rules = [
        FactoryGirl.create(:firewall_rule, :name => "Foo", :display_name => "Foo", :port => 1234),
        FactoryGirl.create(:firewall_rule, :name => "Foo", :display_name => "Foo")
      ]
      @record = FactoryGirl.create(:security_group_with_firewall_rules, :firewall_rules => firewall_rules )
      expect(textual_group_firewall).to be_kind_of(Struct)
    end
  end
end
