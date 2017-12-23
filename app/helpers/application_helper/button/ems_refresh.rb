class ApplicationHelper::Button::EmsRefresh < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    super
    @error_message ||= _("Credentials must be valid to refresh a provider") unless @record.authentication_status.downcase == "valid"
    @error_message.present?
  end
end
