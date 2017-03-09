class ApplicationHelper::Button::OrchestrationStackRetireNow < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _('Orchestration Stack is already retired') if @record.retired
    @error_message.present?
  end
end
