class ApplicationHelper::Button::GenericObjectDefinitionCustomButtonGroupButtonNew < ApplicationHelper::Button::Basic
  def visible?
    @cb_group.nil? && @cb.nil?
  end
end
