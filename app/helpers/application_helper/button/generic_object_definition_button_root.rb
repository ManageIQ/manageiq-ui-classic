class ApplicationHelper::Button::GenericObjectDefinitionButtonRoot < ApplicationHelper::Button::Basic
  def visible?
    @record.nil? == true
  end
end
