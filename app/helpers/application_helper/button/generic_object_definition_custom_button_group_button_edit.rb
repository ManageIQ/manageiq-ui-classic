class ApplicationHelper::Button::GenericObjectDefinitionCustomButtonGroupButtonEdit < ApplicationHelper::Button::Basic
  def visible?
    @cb_group.present?
  end
end
