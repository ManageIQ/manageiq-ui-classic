describe EmsInfraHelper::TextualSummary do
  before do
    instance_variable_set(:@record, FactoryBot.create(:ems_infra))
    allow(self).to receive(:textual_authentications).and_return([])
  end

  include_examples "textual_group", "Relationships", %i(
    clusters
    hosts
    datastores
    vms
    templates
    orchestration_stacks
    ems_cloud
    network_manager
    custom_button_events
    tenant
  )

  include_examples "textual_group", "Properties", %i(
    hostname
    ipaddress
    type
    port
    cpu_resources
    memory_resources
    cpus
    cpu_cores
    guid
    host_default_vnc_port_range
  )

  include_examples "textual_group", "Status", %i(refresh_status refresh_date orchestration_stacks_status)

  include_examples "textual_group_smart_management", %i(zone)

  describe '#textual_tenant' do
    let(:ems) { FactoryBot.create(:ems_infra) }
    let(:tenant) { FactoryBot.create(:tenant) }

    before do
      login_as user
      instance_variable_set(:@record, ems)
      allow(ems).to receive(:tenant).and_return(tenant)
      allow(tenant).to receive(:name).and_return('Tenant name')
    end

    context 'Tenant is not available for non admin user' do
      let(:user) { FactoryBot.create(:user) }

      include_examples 'textual_tenant', nil
    end

    context 'Tenant is available for admin user' do
      let(:user) { User.find_by(:userid => 'admin') }

      include_examples 'textual_tenant', :label => _("Tenant"), :value => 'Tenant name'
    end
  end
end
