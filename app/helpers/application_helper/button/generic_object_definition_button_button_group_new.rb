class ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupNew < ApplicationHelper::Button::Basic
  def visible?
    @actions_node || @record.kind_of?(GenericObjectDefinition)
  end
end
