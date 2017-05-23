require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::EmbeddedAnsible do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  before(:each) do
    MiqRegion.seed
    EvmSpecHelper.create_guid_miq_server_zone
  end

  context 'Embedded Ansible role is turned on and provider is present' do
    before do
      server_role = FactoryGirl.create(
        :server_role,
        :name              => "embedded_ansible",
        :description       => "Embedded Ansible",
        :max_concurrent    => 1,
        :external_failover => false,
        :role_scope        => "zone"
      )
      FactoryGirl.create(
        :assigned_server_role,
        :miq_server_id  => MiqServer.first.id,
        :server_role_id => server_role.id,
        :active         => true,
        :priority       => 1
      )
      # Add embedded Ansible provider if there is none
      FactoryGirl.create(:provider_embedded_ansible) if ManageIQ::Providers::EmbeddedAnsible::Provider.count == 0
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
