describe ConfigurationJobHelper::TextualSummary do
  include ApplicationHelper

  let(:zone) { EvmSpecHelper.local_miq_server.zone }
  let(:automation_provider) { FactoryBot.create(:provider_ansible_tower, :name => "ansibletest", :url => "test", :zone => zone) }

  it "#textual_provider" do
    manager = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider.id)
    @record = FactoryBot.create(:ansible_tower_job, :ext_management_system => manager)
    expect(textual_provider[:image]).to eq("svg/vendor-ansible.svg")
    expect(textual_provider[:link]).to eq("/ems_automation/show/#{manager.id}")
  end

  include_examples "textual_group", "Relationships", %i(provider service parameters status)
  include_examples "textual_group", "Properties", %i(name description type status status_reason)
end
