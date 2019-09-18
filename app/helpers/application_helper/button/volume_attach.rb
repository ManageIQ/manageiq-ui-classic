class ApplicationHelper::Button::VolumeAttach < ApplicationHelper::Button::Basic
  def disabled?
    if !@record.is_available?(:attach_volume)
      @error_message = @record.is_available_now_error_message(:attach_volume)
    elsif @record.status != "available"
      @error_message = _("Cloud Volume \"%{name}\" is not available to be attached to any Instances") % {:name => @record.name}
    end
    @error_message.present?
  end
end
