class ApplicationHelper::Button::GenericObjectDefinitionCustomButtonButtonNew < ApplicationHelper::Button::Basic
  def visible?
    @cb.nil?
  end
end
