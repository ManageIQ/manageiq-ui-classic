describe ApplicationHelper::Button::EmbeddedAnsible do
  before do
    MiqRegion.seed
    EvmSpecHelper.create_guid_miq_server_zone
  end

  let(:view_context) { setup_view_context_with_sandbox({}) }
  subject { described_class.new(view_context, {}, {}, {}) }

  context 'Embedded Ansible role is turned on and provider is present' do
    before do
      server_role = ServerRole.find_by(:name => "embedded_ansible")
      FactoryBot.create(
        :assigned_server_role,
        :miq_server_id  => MiqRegion.my_region.active_miq_servers.first.id,
        :server_role_id => server_role.id,
        :active         => true,
        :priority       => 1
      )

      FactoryBot.create(:provider_embedded_ansible)
    end
    it '#disabled? returns false' do
      expect(subject.disabled?).to be false
    end
  end

  context 'Embedded Ansible provider is missing & Role is not enabled' do
    it '#disabled? returns true' do
      expect(subject.disabled?).to be true
    end
  end
end
