class ApplicationHelper::Button::CatalogItemCopyButton < ApplicationHelper::Button::Basic
  def disabled?
    !@record.template_valid? || @record.type == 'ServiceTemplateAnsiblePlaybook'
  end
end
