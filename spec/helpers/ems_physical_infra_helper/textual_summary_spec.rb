describe EmsPhysicalInfraHelper::TextualSummary do
  before do
    instance_variable_set(:@record, FactoryGirl.create(:ems_infra))
    allow(@record).to receive(:authentication_userid_passwords).and_return([])
    allow(self).to receive(:textual_authentications).and_return([])
  end

  include_examples "textual_group", "Properties", %i(hostname type port guid)

  include_examples "textual_group", "Overview", %i(topology), "topology"

  include_examples "textual_group", "Relationships", %i(
    physical_racks
    physical_chassis
    physical_switches
    physical_storages
    physical_servers
    datastores
    vms
    physical_servers_with_host
  )

  include_examples "textual_group_smart_management", %i(zone)

  include_examples "textual_group", "Status", %i(refresh_status refresh_date)
end
