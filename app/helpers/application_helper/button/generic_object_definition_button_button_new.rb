class ApplicationHelper::Button::GenericObjectDefinitionButtonButtonNew < ApplicationHelper::Button::Basic
  def visible?
    @record.kind_of?(GenericObjectDefinition) || @record.kind_of?(CustomButtonSet)
  end
end
