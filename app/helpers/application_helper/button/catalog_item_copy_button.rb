class ApplicationHelper::Button::CatalogItemCopyButton < ApplicationHelper::Button::Basic
  def disabled?
    @error_message = N_('This Item cannot be copied') if !@record.template_valid? || @record.type == 'ServiceTemplateAnsiblePlaybook'
    @error_message.present?
  end
end
