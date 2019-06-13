describe EmsPhysicalInfraHelper::TextualSummary do
  before do
    instance_variable_set(:@record, FactoryBot.create(:ems_vmware))
    allow(@record).to receive(:authentication_userid_passwords).and_return([])
    allow(self).to receive(:textual_authentications).and_return([])
  end

  include_examples "textual_group", "Properties", %i(hostname type port guid)

  include_examples "textual_group", "Overview", %i(topology), "topology"

  include_examples "textual_group", "Relationships", %i(
    datastores
    physical_chassis
    physical_racks
    physical_servers
    physical_servers_with_host
    physical_storages
    physical_switches
    vms
    custom_button_events
  )

  include_examples "textual_group_smart_management", %i(zone)

  include_examples "textual_group", "Status", %i(refresh_status refresh_date)
end
