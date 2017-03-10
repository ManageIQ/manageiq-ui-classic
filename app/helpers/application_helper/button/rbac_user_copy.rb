class ApplicationHelper::Button::RbacUserCopy < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _('Super Administrator can not be copied') if @record.super_admin_user?
    @error_message.present?
  end
end
