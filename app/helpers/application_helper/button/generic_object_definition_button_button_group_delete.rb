class ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupDelete < ApplicationHelper::Button::Basic
  def visible?
    @record.kind_of?(CustomButtonSet)
  end

  def disabled?
    !@record.kind_of?(CustomButtonSet)
  end
end
