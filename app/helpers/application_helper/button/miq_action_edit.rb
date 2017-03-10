class ApplicationHelper::Button::MiqActionEdit < ApplicationHelper::Button::MiqActionModify
  needs :@record

  def disabled?
    super
    @error_message = _("Default actions can not be changed.") if @record.action_type == "default"
    @error_message.present?
  end
end
