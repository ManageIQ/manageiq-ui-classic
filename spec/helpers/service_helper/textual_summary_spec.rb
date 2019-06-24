describe ServiceHelper::TextualSummary do
  describe ".textual_orchestration_stack" do
    let(:os_cloud) { FactoryBot.create(:orchestration_stack_cloud, :name => "cloudstack1") }
    let(:os_infra) { FactoryBot.create(:orchestration_stack_openstack_infra, :name => "infrastack1") }

    before do
      login_as FactoryBot.create(:user)
    end

    subject { textual_orchestration_stack }
    it 'contains the link to the associated cloud stack' do
      @record = FactoryBot.create(:service)
      allow(@record).to receive(:orchestration_stack).and_return(os_cloud)
      expect(textual_orchestration_stack).to eq(os_cloud)
    end

    it 'contains the link to the associated infra stack' do
      @record = FactoryBot.create(:service)
      allow(@record).to receive(:orchestration_stack).and_return(os_infra)
      expect(textual_orchestration_stack).to eq(os_infra)
    end

    it 'contains no link for an invalid stack' do
      os_infra.id = nil
      @record = FactoryBot.create(:service)
      allow(@record).to receive(:orchestration_stack).and_return(os_infra)
      expect(textual_orchestration_stack[:link]).to be_nil
    end
  end

  describe ".textual_agregate_all_vms" do
    let(:vm) { FactoryBot.create(:vm_vmwware, :name => "vm1") }

    before do
      login_as FactoryBot.create(:user)
      @record = FactoryBot.create(:service)
    end

    subject { textual_aggregate_all_vm_cpus }
    it 'displays 0 for nil aggregate_all_vm_cpus' do
      allow(@record).to receive(:aggregate_all_vm_cpus).and_return(nil)
      expect(textual_aggregate_all_vm_cpus).to eq(:label => "CPU", :value => nil)
    end

    subject { textual_aggregate_all_vm_memory }
    it 'displays 0 Bytes for nil aggregate_all_vm_memory' do
      allow(@record).to receive(:aggregate_all_vm_memory).and_return(nil)
      expect(textual_aggregate_all_vm_memory).to eq(:label => "Memory", :value => "0 Bytes")
    end

    subject { textual_aggregate_all_vm_disk_count }
    it 'displays 0 for nil aggregate_all_vm_disk_count' do
      allow(@record).to receive(:aggregate_all_vm_disk_count).and_return(nil)
      expect(textual_aggregate_all_vm_disk_count).to eq(:label => "Disk Count", :value => nil)
    end

    subject { textual_aggregate_all_vm_disk_space_allocated }
    it 'displays 0 Bytes for nil aggregate_all_vm_disk_space_allocated' do
      allow(@record).to receive(:aggregate_all_vm_disk_space_allocated).and_return(nil)
      expect(textual_aggregate_all_vm_disk_space_allocated).to eq(:label => "Disk Space Allocated", :value => "0 Bytes")
    end

    subject { textual_aggregate_all_vm_disk_space_used }
    it 'displays 0 Bytes for nil aggregate_all_vm_disk_space_used' do
      allow(@record).to receive(:aggregate_all_vm_disk_space_used).and_return(nil)
      expect(textual_aggregate_all_vm_disk_space_used).to eq(:label => "Disk Space Used", :value => "0 Bytes")
    end

    subject { textual_aggregate_all_vm_memory_on_disk }
    it 'displays 0 Bytes for nil aggregate_all_vm_memory_on_disk' do
      allow(@record).to receive(:aggregate_all_vm_memory_on_disk).and_return(nil)
      expect(textual_aggregate_all_vm_memory_on_disk).to eq(:label => "Memory on Disk", :value => "0 Bytes")
    end
  end

  describe ".textual_cloud_credential" do
    subject { textual_cloud_credential }
    it 'displays only cloud credentials if available' do
      @job = FactoryBot.create(:embedded_ansible_job)
      machine_credential = FactoryBot.create(:embedded_ansible_machine_credential)
      cloud_credential = FactoryBot.create(:embedded_ansible_amazon_credential)
      allow(@job).to receive(:authentications).and_return([cloud_credential, machine_credential])
      allow(self).to receive(:url_for_only_path).and_return('link')
      expect(textual_cloud_credential).to eq(:label => "Cloud", :value => nil, :title => "Credential (Amazon)", :link => "link")
    end
  end

  describe ".textual_vault_credential" do
    subject { textual_vault_credential }
    it 'displays only vault credentials if available' do
      @job = FactoryBot.create(:embedded_ansible_job)
      vault_credential = FactoryBot.create(:embedded_ansible_vault_credential)
      allow(@job).to receive(:authentications).and_return(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::VaultCredential.where(:id => vault_credential.id))
      allow(self).to receive(:url_for_only_path).and_return('link')
      expect(textual_vault_credential).to eq(:label => "Vault", :value => nil, :title => "Credential (Vault)", :link => "link")
    end
  end

  describe '.calculate_elapsed_time' do
    subject { helper.send(:calculate_elapsed_time, Time.new(2019, 1, 1, 10, 0, 0, 0), Time.new(2019, 1, 1, 11, 5, 0, 0)) }

    it 'calculates elapsed time' do
      expect(subject).to eq("01:05:00")
    end
  end

  before do
    allow(self).to receive(:provisioning_get_job).and_return(true)
    allow(self).to receive(:retirement_get_job).and_return(true)
    allow(self).to receive(:textual_miq_custom_attributes).and_return([])
  end

  include_examples "textual_group", "Properties", %i(name description guid)

  include_examples "textual_group", "Results", %i(status start_time finish_time elapsed_time owner), "provisioning_results"

  include_examples "textual_group", "Details", %i(playbook repository verbosity hosts), "provisioning_details"

  include_examples "textual_group", "Credentials", %i(
    machine_credential
    vault_credential
    network_credential
    cloud_credential
  ), "provisioning_credentials"

  include_examples "textual_group", "Results", %i(status start_time finish_time elapsed_time owner), "retirement_results"

  include_examples "textual_group", "Details", %i(playbook repository verbosity hosts), "retirement_details"

  include_examples "textual_group", "Credentials", %i(
    machine_credential
    vault_credential
    network_credential
    cloud_credential
  ), "retirement_credentials"

  include_examples "textual_group", "Totals for Service VMs", %i(
    aggregate_all_vm_cpus
    aggregate_all_vm_memory
    aggregate_all_vm_disk_count
    aggregate_all_vm_disk_space_allocated
    aggregate_all_vm_disk_space_used
    aggregate_all_vm_memory_on_disk
  ), "vm_totals"

  include_examples "textual_group", "Lifecycle", %i(lifecycle_state retirement_date retirement_state owner group created)

  include_examples "textual_group", "Relationships", %i(catalog_item parent_service orchestration_stack job custom_button_events)

  include_examples "textual_group", "Custom Attributes", [], "miq_custom_attributes"

  include_examples "textual_group", "Generic Objects", %i(generic_object_instances), "generic_objects"
end
