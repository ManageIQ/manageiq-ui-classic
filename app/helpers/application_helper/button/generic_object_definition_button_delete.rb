class ApplicationHelper::Button::GenericObjectDefinitionButtonDelete < ApplicationHelper::Button::Basic
  def visible?
    @record.kind_of?(GenericObjectDefinition) && @display != 'generic_objects' && !@actions_node
  end

  def disabled?
    @record.kind_of?(GenericObjectDefinition) && !@record.generic_objects.count.zero?
  end
end
