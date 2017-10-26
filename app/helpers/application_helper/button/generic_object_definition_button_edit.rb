class ApplicationHelper::Button::GenericObjectDefinitionButtonEdit < ApplicationHelper::Button::Basic
  def visible?
    if @display == 'generic_objects' || !@record.kind_of?(GenericObjectDefinition)
      false
    else
      true
    end
  end
end
