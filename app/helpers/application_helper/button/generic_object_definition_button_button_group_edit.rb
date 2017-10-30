class ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupEdit < ApplicationHelper::Button::Basic
  def visible?
    @record.kind_of?(CustomButtonSet)
  end
end
