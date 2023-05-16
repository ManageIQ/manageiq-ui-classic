describe AnsiblePlaybookHelper::TextualSummary do
  include_examples "textual_group_smart_management"
  include_examples "textual_group", "Properties", %i[name description created updated]
  include_examples "textual_group", "Relationships", %i[provider repository]
end
