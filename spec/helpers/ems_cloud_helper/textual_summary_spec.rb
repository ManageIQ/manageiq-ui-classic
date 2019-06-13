describe EmsCloudHelper::TextualSummary do
  context "#textual_instances and #textual_images" do
    before do
      @record = FactoryBot.create(:ems_openstack, :zone => FactoryBot.build(:zone))
      allow(self).to receive(:role_allows?).and_return(true)
      allow(controller).to receive(:restful?).and_return(true)
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
      instance_variable_set(:@record, FactoryBot.create(:ems_vmware_cloud))
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
    )
    include_examples "textual_group", "Properties", %i(description hostname ipaddress type port guid region keystone_v3_domain_id)

    include_examples "textual_group", "Status", %i(refresh_status refresh_date)

    include_examples "textual_group_smart_management", %i(zone)
  end

  describe '#textual_description' do
    let(:ems) { FactoryBot.create(:ems_vmware_cloud) }

    before do
      instance_variable_set(:@record, ems)
    end

    context "EMS instance doesn't support :description" do
      include_examples 'textual_description', nil
    end

    context "EMS instance has :description" do
      before { allow(ems).to receive(:description).and_return('EmsCloud instance description') }
      include_examples 'textual_description', :label => _("Description"), :value => 'EmsCloud instance description'
    end
  end
end
