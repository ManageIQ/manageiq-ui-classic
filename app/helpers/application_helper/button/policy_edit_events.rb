class ApplicationHelper::Button::PolicyEditEvents < ApplicationHelper::Button::PolicyEdit
  def visible?
    @record.mode != "compliance"
  end
end
