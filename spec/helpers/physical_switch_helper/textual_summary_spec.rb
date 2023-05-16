describe PhysicalSwitchHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i[
    name
    product_name
    manufacturer
    serial_number
    part_number
    ports
    health_state
    uid_ems
    description
  ]

  include_examples "textual_group", "Relationships", %i[ext_management_system connected_physical_servers]

  include_examples "textual_group", "Power Management", %i[power_state], "power_management"
end
