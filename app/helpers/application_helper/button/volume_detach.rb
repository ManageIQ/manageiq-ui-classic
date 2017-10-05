class ApplicationHelper::Button::VolumeDetach < ApplicationHelper::Button::Basic
  def disabled?
    if !@record.is_available?(:detach_volume)
      @error_message = @record.is_available_now_error_message(:detach_volume)
    elsif @record.number_of(:vms) == 0
      @error_message = _("Cloud Volume \"%{name}\" is not attached to any Instances") % {:name => @record.name}
    end
    @error_message.present?
  end
end
