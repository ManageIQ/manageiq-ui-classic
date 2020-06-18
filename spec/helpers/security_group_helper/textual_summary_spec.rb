describe SecurityGroupHelper::TextualSummary do
  describe ".textual_group_firewall" do
    before do
      login_as FactoryBot.create(:user)
    end

    subject { textual_group_firewall }
    it 'returns TextualTable struct with list of of firewall rules' do
      firewall_rules = [
        FactoryBot.create(:firewall_rule, :name => "Foo", :display_name => "Foo", :port => 1234),
        FactoryBot.create(:firewall_rule, :name => "Foo", :display_name => "Foo")
      ]
      @record = FactoryBot.create(:security_group_with_firewall_rules, :firewall_rules => firewall_rules)
      expect(subject).to be_kind_of(Struct)
    end
  end

  include_examples "textual_group", "Properties", %i(name description type)

  include_examples "textual_group", "Relationships", %i(
    parent_ems_cloud
    ems_network
    cloud_tenant
    instances
    orchestration_stack
    network_ports
    network_router
    cloud_subnet
    custom_button_events
  )
end
