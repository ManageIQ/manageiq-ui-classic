class ApplicationHelper::Button::GenericObjectDefinitionDeleteButton < ApplicationHelper::Button::Basic
  def visible?
    @display != 'generic_objects'
  end

  def disabled?
    !@record.generic_objects.count.zero?
  end
end
