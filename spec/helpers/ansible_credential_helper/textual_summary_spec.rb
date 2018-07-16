describe AnsibleCredentialHelper::TextualSummary do
  include_examples "textual_group_smart_management"
  include_examples "textual_group", "Properties", %i(name type created updated)
  include_examples "textual_group", "Relationships", %i(repositories)
end
