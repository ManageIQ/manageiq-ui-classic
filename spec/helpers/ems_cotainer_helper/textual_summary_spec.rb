describe EmsContainerHelper::TextualSummary do
  context "providers custom attributes" do
    before do
      @record = FactoryGirl.build(:ems_openshift)
      allow_any_instance_of(described_class).to receive(:role_allows?).and_return(true)
      allow(controller).to receive(:restful?).and_return(true)
      allow(controller).to receive(:controller_name).and_return("ems_container")
    end

    it "should only display custom attributes from allowed sections" do
      @record.save
      @record.custom_attributes.create(:section => "metadata",
                                       :name    => "Example_custom_attribute",
                                       :value   => 4)
      @record.custom_attributes.create(:section => "no_allowed",
                                       :name    => "Example_custom_attribute_2",
                                       :value   => 5)

      expect(textual_miq_displayable_custom_attributes.count).to eq(1)
    end

    it "should parse custom attributes to labels and values" do
      @record.save
      @record.custom_attributes.create(:section => "metadata",
                                       :name    => "Example_custom_attribute",
                                       :value   => 4)

      expect(textual_miq_displayable_custom_attributes.first[:label]).to eq("Example custom attribute")

      expect(textual_miq_displayable_custom_attributes.first[:value]).to eq("4")
    end

    it "should return nil if no custom attributes" do
      expect(textual_miq_displayable_custom_attributes).to eq(nil)
    end
  end
end
