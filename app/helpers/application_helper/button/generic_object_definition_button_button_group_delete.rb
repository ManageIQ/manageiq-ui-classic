class ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupDelete < ApplicationHelper::Button::Basic
  def disabled?
    !@record.custom_buttons.count.zero?
  end
end
