class ApplicationHelper::Button::VolumeClone < ApplicationHelper::Button::Basic
  def disabled?
    if !@record.supports?(:clone)
      @error_message = _("Cloud Volume \"%{name}\" cannot be cloned because %{reason}") % {:name => @record.name, :reason => @record.unsupported_reason(:clone)}
    end
    @error_message.present?
  end
end
