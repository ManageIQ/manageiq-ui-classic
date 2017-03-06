class ApplicationHelper::Button::ApDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _('Sample Analysis Profile cannot be deleted') if @record.read_only
    @error_message.present?
  end
end
