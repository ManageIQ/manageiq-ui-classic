class ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupNew < ApplicationHelper::Button::Basic
  def visible?
    @actions_node
  end
end
