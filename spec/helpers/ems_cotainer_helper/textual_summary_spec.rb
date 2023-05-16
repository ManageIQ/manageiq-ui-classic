describe EmsContainerHelper::TextualSummary do
  context "providers custom attributes" do
    before do
      @record = FactoryBot.build(:ems_openshift)
      allow(self).to receive(:role_allows?).and_return(true)
      allow(controller).to receive(:restful?).and_return(true)
      allow(controller).to receive(:controller_name).and_return("ems_container")
    end

    it "should parse custom attributes to labels and values" do
      @record.custom_attributes << FactoryBot.build(:custom_attribute,
                                                    :name  => "Example_custom_attribute",
                                                    :value => 4)

      expect(textual_miq_custom_attributes.first[:label]).to eq("Example custom attribute")

      expect(textual_miq_custom_attributes.first[:value]).to eq("4")
    end

    it "should return nil if no custom attributes" do
      expect(textual_miq_custom_attributes).to eq(nil)
    end
  end

  describe 'Creates correctly textual groups' do
    let(:textual_authentications_status) { [] }
    include_examples "textual_group", "Properties", %i[name type hostname port cpu_cores memory_resources]
    include_examples "textual_group", "Relationships", %i[
      container_projects
      container_services
      container_replicators
      container_groups
      containers
      container_nodes
      container_image_registries
      container_images
      volumes
      container_builds
      container_templates
      custom_button_events
    ]
    include_examples "textual_group", "Status", %i[authentications_status metrics_status refresh_status refresh_date data_collection_state]
    include_examples "textual_group_smart_management", %i[zone]
  end
end
