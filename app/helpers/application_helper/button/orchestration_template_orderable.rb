class ApplicationHelper::Button::OrchestrationTemplateOrderable < ApplicationHelper::Button::Basic
  def disabled?
    @error_message = _('This Template is already orderable') if @record.orchestration_template.supports?(:order)
    @error_message.present?
  end
end
