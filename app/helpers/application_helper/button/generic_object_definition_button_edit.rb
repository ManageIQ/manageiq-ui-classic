class ApplicationHelper::Button::GenericObjectDefinitionButtonEdit < ApplicationHelper::Button::Basic
  def visible?
    if @display == 'generic_objects' || !@record.kind_of?(GenericObjectDefinition) || @actions_node
      false
    else
      true
    end
  end
end
