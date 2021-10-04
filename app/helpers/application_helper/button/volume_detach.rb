class ApplicationHelper::Button::VolumeDetach < ApplicationHelper::Button::Basic
  def disabled?
    if !@record.supports?(:detach_volume)
      @error_message = @record.unsupported_reason(:detach_volume)
    end
    @error_message.present?
  end
end
