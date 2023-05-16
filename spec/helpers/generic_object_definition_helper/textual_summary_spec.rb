describe GenericObjectDefinitionHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i[name created updated]

  include_examples "textual_group", "Relationships", %i[generic_objects]
end
