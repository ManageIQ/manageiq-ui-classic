class ApplicationHelper::Button::MiqTemplateScan < ApplicationHelper::Button::VmInstanceTemplateScan
  needs :@record

  def disabled?
    return true if super
    @error_message = @record.active_proxy_error_message unless @record.has_active_proxy?
    @error_message.present?
  end
end
