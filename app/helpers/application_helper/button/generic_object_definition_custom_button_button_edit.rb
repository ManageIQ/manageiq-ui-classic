class ApplicationHelper::Button::GenericObjectDefinitionCustomButtonButtonEdit < ApplicationHelper::Button::Basic
  def visible?
    @cb.present?
  end
end
