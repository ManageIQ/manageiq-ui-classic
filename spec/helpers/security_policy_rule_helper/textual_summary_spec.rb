describe SecurityPolicyRuleHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i(name description type ems_ref sequence_number status action direction ip_protocol)

  include_examples "textual_group", "Relationships", %i(
    ems_network cloud_tenant security_policy custom_button_events
  )
end
