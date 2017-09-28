class ApplicationHelper::Button::GenericObjectDefinitionDeleteButton < ApplicationHelper::Button::Basic
  def visible?
    if @display == 'generic_objects'
      false
    else
      true
    end
  end

  def disabled?
    if @record.generic_objects.count > 0
      true
    else
      false
    end
  end
end
