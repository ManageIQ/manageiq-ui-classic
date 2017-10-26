class ApplicationHelper::Button::GenericObjectDefinitionDeleteButton < ApplicationHelper::Button::Basic
  def visible?
    @record.kind_of?(GenericObjectDefinition) && @display != 'generic_objects'
  end

  def disabled?
    @record.kind_of?(GenericObjectDefinition) && !@record.generic_objects.count.zero?
  end
end
