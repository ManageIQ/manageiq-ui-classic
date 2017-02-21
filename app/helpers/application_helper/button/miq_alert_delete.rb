class ApplicationHelper::Button::MiqAlertDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _("Alerts referenced by Actions can not be deleted") unless @record.owning_miq_actions.empty?
    @error_message = _("Alerts that belong to Alert Profiles can not be deleted") unless @record.memberof.empty?
    @error_message.present?
  end
end
