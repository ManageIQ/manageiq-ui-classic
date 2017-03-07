class ApplicationHelper::Button::RbacGroupDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _('This Group is Read Only and can not be deleted') if @record.read_only
    @error_message.present?
  end
end
