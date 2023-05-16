describe PhysicalRackHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i[name ems_ref]

  include_examples "textual_group", "Relationships", %i[ext_management_system physical_chassis physical_servers physical_storages]
end
