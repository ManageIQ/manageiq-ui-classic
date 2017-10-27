class ApplicationHelper::Button::GenericObjectDefinitionButtonButtonEdit < ApplicationHelper::Button::Basic
  def visible?
    @record.kind_of?(CustomButton)
  end

  def disabled?
    !@record.kind_of?(CustomButton)
  end
end
