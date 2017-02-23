class ApplicationHelper::Button::MiqActionDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _("Actions assigned to Policies can not be deleted") unless @record.miq_policies.empty?
    @error_message = _("Default actions can not be deleted.") if @record.action_type == "default"
    @error_message.present?
  end
end
