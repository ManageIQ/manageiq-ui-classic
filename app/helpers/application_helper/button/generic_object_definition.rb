class ApplicationHelper::Button::GenericObjectDefinition < ApplicationHelper::Button::Basic
  def visible?
    if @display == 'generic_objects'
      false
    else
      true
    end
  end
end
