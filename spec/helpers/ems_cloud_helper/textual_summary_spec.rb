describe EmsCloudHelper::TextualSummary do
  context "#textual_instances and #textual_images" do
    before do
      @record = FactoryGirl.create(:ems_openstack, :zone => FactoryGirl.build(:zone))
      allow_any_instance_of(described_class).to receive(:role_allows?).and_return(true)
      allow(controller).to receive(:restful?).and_return(true)
      allow(controller).to receive(:controller_name).and_return("ems_cloud")
    end

    it "sets restful path for instances in summary for restful controllers" do
      FactoryGirl.create(:vm_openstack, :ems_id => @record.id)

      expect(textual_instances[:link]).to eq("/ems_cloud/#{@record.id}?display=instances")
    end

    it "sets restful path for images in summary for restful controllers" do
      FactoryGirl.create(:template_cloud, :ems_id => @record.id)

      expect(textual_images[:link]).to eq("/ems_cloud/#{@record.id}?display=images")
    end

    it "sets correct path for security_groups on summary screen" do
      FactoryGirl.create(:security_group, :name => "sq_1", :ext_management_system => @record.network_manager)
      expect(textual_security_groups[:link]).to eq("/ems_cloud/#{@record.id}?display=security_groups")
    end
  end
end
