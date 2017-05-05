describe ApplicationHelper::Button::EmbeddedAnsible do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  subject { described_class.new(view_context, {}, {}, {}) }

  context 'Embedded Ansible provider is present' do
    before do
      # Add embedded Ansible provider if there is none
      FactoryGirl.create(:provider_embedded_ansible) if ManageIQ::Providers::EmbeddedAnsible::Provider.count == 0
      allow_any_instance_of(ManageIQ::Providers::EmbeddedAnsible::AutomationManager).to receive(:last_refresh_status).and_return("success")
    end
    it '#disabled? returns false' do
      expect(subject.disabled?).to be false
    end
  end
  context 'Embedded Ansible provider is missing' do
    before do
      # no embedded provider
      allow(ManageIQ::Providers::EmbeddedAnsible::Provider).to receive(:count).and_return(0)
    end
    it '#disabled? returns true' do
      expect(subject.disabled?).to be true
    end
  end
end
