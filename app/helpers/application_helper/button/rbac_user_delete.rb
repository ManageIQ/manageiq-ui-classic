class ApplicationHelper::Button::RbacUserDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _('User [Administrator] can not be deleted') if @record.userid == 'admin'
    @error_message.present?
  end
end
