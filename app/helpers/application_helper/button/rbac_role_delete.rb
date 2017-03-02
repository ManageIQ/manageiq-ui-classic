class ApplicationHelper::Button::RbacRoleDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = if @record.read_only
                       _('This Role is Read Only and can not be deleted')
                     elsif @record.group_count > 0
                       _('This Role is in use by one or more Groups and can not be deleted')
                     end
    @error_message.present?
  end
end
