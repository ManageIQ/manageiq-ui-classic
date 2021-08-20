class ApplicationHelper::Button::VolumeAttach < ApplicationHelper::Button::Basic
  def disabled?
    if !@record.supports?(:attach_volume)
      @error_message = _("Cloud Volume \"%{name}\" cannot be attached because %{reason}") % {:name => @record.name, :reason => @record.unsupported_reason(:attach_volume)}
    end
    @error_message.present?
  end
end
