describe EmsCloudHelper::TextualSummary do
  include ApplicationHelper

  context "#textual_instances and #textual_images" do
    before do
      @record = FactoryBot.create(:ems_openstack)
      allow(self).to receive(:role_allows?).and_return(true)
      allow(controller).to receive(:controller_name).and_return("ems_cloud")
    end

    it "sets restful path for instances in summary for restful controllers" do
      FactoryBot.create(:vm_openstack, :ems_id => @record.id)

      expect(textual_instances[:link]).to eq("/ems_cloud/#{@record.id}?display=instances")
    end

    it "sets restful path for images in summary for restful controllers" do
      FactoryBot.create(:template_cloud, :ems_id => @record.id)

      expect(textual_images[:link]).to eq("/ems_cloud/#{@record.id}?display=images")
    end

    it "sets correct path for security_groups on summary screen" do
      FactoryBot.create(:security_group, :name => "sq_1", :ext_management_system => @record.network_manager)
      expect(textual_security_groups[:link]).to eq("/ems_cloud/#{@record.id}?display=security_groups")
    end
  end

  context "#textual_groups" do
    before do
      instance_variable_set(:@record, FactoryBot.create(:ems_cloud))
      allow(self).to receive(:textual_authentications).and_return([])
      allow(@record).to receive(:authentication_for_summary).and_return([])
    end

    include_examples "textual_group", "Relationships", %i(
      ems_infra
      network_manager
      availability_zones
      host_aggregates
      cloud_tenants
      flavors
      security_groups
      instances
      images
      cloud_volumes
      orchestration_stacks
      storage_managers
      custom_button_events
      tenant
    )

    include_examples "textual_group", "Properties", %i(description hostname ipaddress type port guid region keystone_v3_domain_id)

    include_examples "textual_group", "Status", %i(refresh_status refresh_date)

    include_examples "textual_group_smart_management", %i(zone)
  end

  describe '#textual_description' do
    context "EMS instance doesn't support :description" do
      before { instance_variable_set(:@record, FactoryBot.create(:ext_management_system)) }

      include_examples 'textual_description', nil
    end

    context "EMS instance has :description" do
      before { instance_variable_set(:@record, FactoryBot.create(:ems_cloud)) }

      include_examples 'textual_description', :label => _("Description"), :value => "US East (N. Virginia)"
    end
  end

  describe '#textual_tenant' do
    let(:ems) { FactoryBot.create(:ems_cloud) }
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
      let(:user) { FactoryBot.create(:user_admin, :userid => 'admin') }

      include_examples 'textual_tenant', :label => _("Tenant"), :value => 'Tenant name'
    end
  end
end
