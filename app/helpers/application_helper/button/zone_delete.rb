class ApplicationHelper::Button::ZoneDelete < ApplicationHelper::Button::Basic
  needs :@selected_zone

  def disabled?
    @error_message = @selected_zone.message_for_invalid_delete
    @error_message.present?
  end
end
