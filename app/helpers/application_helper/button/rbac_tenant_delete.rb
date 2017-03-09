class ApplicationHelper::Button::RbacTenantDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _('Default Tenant can not be deleted') if @record.parent.nil?
    @error_message.present?
  end
end
