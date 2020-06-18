describe NetworkServiceHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i(name description type ems_ref)

  include_examples "textual_group", "Relationships", %i[
    ems_network cloud_tenant security_policy_rule custom_button_events
  ]
end
