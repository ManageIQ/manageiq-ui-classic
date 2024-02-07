class ApplicationHelper::Button::OrchestrationTemplateViewInCatalog < ApplicationHelper::Button::Basic
  def disabled?
    @error_message = _('This Template is not orderable') unless @record.orchestration_template.supports?(:order)
    @error_message.present?
  end
end
