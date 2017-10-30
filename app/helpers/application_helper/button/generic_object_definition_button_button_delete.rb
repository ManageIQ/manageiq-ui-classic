class ApplicationHelper::Button::GenericObjectDefinitionButtonButtonDelete < ApplicationHelper::Button::Basic
  def visible?
    @record.kind_of?(CustomButton)
  end
end
