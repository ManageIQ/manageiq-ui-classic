describe SecurityPolicyHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i(name description type ems_ref sequence_number)

  include_examples "textual_group", "Relationships", %i(
    ems_network cloud_tenant custom_button_events
  )
end
