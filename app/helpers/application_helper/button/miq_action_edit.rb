class ApplicationHelper::Button::MiqActionEdit < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _("Default actions can not be changed.") if @record.action_type == "default"
    @error_message.present?
  end
end
