class ApplicationHelper::Button::VolumeAttach < ApplicationHelper::Button::Basic
  def disabled?
    if !@record.supports?(:attach)
      @error_message = _("Cloud Volume \"%{name}\" cannot be attached because %{reason}") % {:name => @record.name, :reason => @record.unsupported_reason(:attach)}
    end
    @error_message.present?
  end
end
