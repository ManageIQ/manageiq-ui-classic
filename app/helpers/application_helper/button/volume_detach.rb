class ApplicationHelper::Button::VolumeDetach < ApplicationHelper::Button::Basic
  def disabled?
    if !@record.supports?(:detach)
      @error_message = @record.unsupported_reason(:detach)
    end
    @error_message.present?
  end
end
