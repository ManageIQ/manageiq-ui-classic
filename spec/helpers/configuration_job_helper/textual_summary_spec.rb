describe ConfigurationJobHelper::TextualSummary do
  include ApplicationHelper

  let(:zone) { EvmSpecHelper.local_miq_server.zone }
  let(:automation_provider) { FactoryGirl.create(:provider_ansible_tower, :name => "ansibletest", :url => "test", :zone => zone) }

  it "#textual_provider" do
    manager = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider.id)
    @record = FactoryGirl.create(:ansible_tower_job, :ext_management_system => manager)
    expect(textual_provider[:image]).to eq("svg/vendor-ansible.svg")
    expect(textual_provider[:link]).to eq("/automation_manager/explorer/at-#{manager.id}?accordion=automation_manager_providers")
  end
end
