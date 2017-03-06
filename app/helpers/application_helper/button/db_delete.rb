class ApplicationHelper::Button::DbDelete < ApplicationHelper::Button::Basic
  def disabled?
    @error_message = _('Default Dashboard cannot be deleted') if @db.read_only
    @error_message.present?
  end
end
