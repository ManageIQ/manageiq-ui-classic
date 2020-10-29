module PhysicalStorageHelper::TextualSummary
  include TextualMixins::NewTextualSummary

  def textual_group_list
    textual_summary do
      textual_big_group do
        textual_group "Properties" do
          function_textual_field :label => _("Name"), :value => @record.name
          textual_field :label => _("Product Name"), :value => @record.asset_detail&.product_name
          textual_field :label => _("Serial Number"), :value => @record.asset_detail&.serial_number
          textual_field :label => _("Health State"), :value => @record.health_state
          textual_field :label => _("Enclosure Count"), :value => @record.enclosures
          textual_field :label => _("Drive Bays"), :value => @record.drive_bays
          textual_field :label => _("UUID"), :value => @record.uid_ems
          textual_field :label => _("Description"), :value => @record.asset_detail&.description
        end
        textual_group "Relationships" do
          hash_textual_field {textual_link(ExtManagementSystem.find(@record.ems_id))}

          hash_textual_field @record.physical_rack_id.present? {textual_link(PhysicalRack.find(@record.physical_rack_id))}
          hash_textual_field @record.physical_chassis_id.present? {textual_link(PhysicalChassis.find(@record.physical_chassis_id))}
        end

        textual_group "Asset Details" do
          textual_field :label => _("Machine Type"), :value => @record.asset_detail&.machine_type
          textual_field :label => _("Model"), :value => @record.asset_detail&.model
          textual_field :label => _("Contact"), :value => @record.asset_detail&.contact
          textual_field :label => _("Location"), :value => @record.asset_detail&.location
          textual_field :label => _("Room"), :value => @record.asset_detail&.room
          textual_field :label => _("Rack Name"), :value => @record.asset_detail&.rack_name
          textual_field :label => _("Lowest Rack Unit"), :value => @record.asset_detail&.lowest_rack_unit
        end

      end
    end
  end

end
