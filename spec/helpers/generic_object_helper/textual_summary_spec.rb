describe GenericObjectHelper::TextualSummary do
  context "Textual Properties for GO instances" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      @generic_obj_defn = FactoryGirl.create(
        :generic_object_definition,
        :name       => "test_definition",
        :properties => {
          :attributes   => {
            :flag       => "boolean",
            :data_read  => "float",
            :max_number => "integer",
            :server     => "string",
            :s_time     => "datetime"
          },
          :associations => {"cp" => "ManageIQ::Providers::CloudManager", "vms" => "Vm"},
          :methods      => %w(some_method)
        }
      )
      @generic_obj_defn_with_no_properties = FactoryGirl.create(:generic_object_definition)
    end

    it "displays the GO Attributes in the name/value format when Attributes exist" do
      @record = FactoryGirl.create(:generic_object, :generic_object_definition_id => @generic_obj_defn.id, :flag => true)

      expected = TextualMultilabel.new(
        "Attributes",
        :additional_table_class => "table-fixed",
        :labels                 => ["Name", "Value"],
        :values                 => {"flag" => true}
      )

      expect(textual_group_attribute_details_list).to eq(expected)
    end

    it "displays 'No Attributes defined' when Attributes do not exist" do
      @record = FactoryGirl.create(:generic_object, :generic_object_definition_id => @generic_obj_defn.id)

      expected = TextualGroup.new("Attributes", %i(attributes_none))

      expect(textual_group_attribute_details_list).to eq(expected)
    end

    it "displays the GO Associations when Associations exist" do
      vm1 = FactoryGirl.create(:vm_vmware)
      vm2 = FactoryGirl.create(:vm_openstack)
      ems = FactoryGirl.create(:ems_cloud)
      @record = FactoryGirl.create(:generic_object,
                                   :generic_object_definition_id => @generic_obj_defn.id,
                                   :cp                           => [ems],
                                   :vms                          => [vm1, vm2])

      expected = TextualGroup.new("Associations", %i(cp vms))

      expect(textual_group_associations).to eq(expected)
    end

    it "displays 'No Associations defined' when do not Associations exist" do
      @record = FactoryGirl.create(:generic_object, :generic_object_definition_id => @generic_obj_defn_with_no_properties.id)

      expected = TextualGroup.new("Associations", %i(associations_none))

      expect(textual_group_associations).to eq(expected)
    end

    it "displays the GO Methods when Methods exist" do
      @record = FactoryGirl.create(:generic_object, :generic_object_definition_id => @generic_obj_defn.id)

      expected = TextualGroup.new("Methods", %i(some_method))

      expect(textual_group_methods).to eq(expected)
    end

    it "displays 'No Methods defined' when do not Methods exist" do
      @record = FactoryGirl.create(:generic_object, :generic_object_definition_id => @generic_obj_defn_with_no_properties.id)

      expected = TextualGroup.new("Methods", %i(methods_none))

      expect(textual_group_methods).to eq(expected)
    end
  end
end
