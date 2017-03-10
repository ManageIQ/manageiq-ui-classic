class ApplicationHelper::Button::HostCheckCompliance < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _("No Compliance Policies assigned to this Host") unless @record.has_compliance_policies?
    @error_message.present?
  end
end
