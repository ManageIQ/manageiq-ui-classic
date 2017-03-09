class ApplicationHelper::Button::VmInstanceTemplateScan < ApplicationHelper::Button::SmartStateScan
  needs :@record

  def visible?
    @record.supports?(:smartstate_analysis) && @record.has_proxy?
  end

  def disabled?
    super
    @error_message ||= @record.active_proxy_error_message unless @record.has_active_proxy?
    @error_message.present?
  end
end
