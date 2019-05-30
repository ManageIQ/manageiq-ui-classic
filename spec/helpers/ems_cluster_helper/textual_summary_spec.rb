describe EmsClusterHelper::TextualSummary do
  before do
    instance_variable_set(:@record, FactoryBot.create(:ems_cluster))
    allow(@record).to receive(:ha_enabled).and_return("something")
    allow(@record).to receive(:ha_admit_control).and_return("something")
    allow(@record).to receive(:drs_enabled).and_return("something")
    allow(@record).to receive(:drs_automation_level).and_return("something")
    allow(@record).to receive(:drs_migration_threshold).and_return("something")
  end
  let(:title_for_hosts) { '101' }

  include_examples "textual_group", "Relationships", %i(
    ems
    parent_datacenter
    total_hosts
    total_direct_vms
    allvms_size
    total_miq_templates
    rps_size
    states_size
    custom_button_events
  )
  include_examples "textual_group", "Totals for VMs", %i(aggregate_vm_memory aggregate_vm_cpus), 'vm_totals'
  include_examples "textual_group", "Totals for 101", %i(
    aggregate_cpu_speed
    aggregate_memory
    aggregate_physical_cpus
    aggregate_cpu_total_cores
    aggregate_disk_capacity
    block_storage_disk_usage
    object_storage_disk_usage
  ), 'host_totals'
  include_examples "textual_group", "Configuration", %i(
    ha_enabled
    ha_admit_control
    drs_enabled
    drs_automation_level
    drs_migration_threshold
  )
end
