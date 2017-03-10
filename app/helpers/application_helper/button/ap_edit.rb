class ApplicationHelper::Button::ApEdit < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _('Sample Analysis Profile cannot be edited') if @record.read_only
    @error_message.present?
  end
end
