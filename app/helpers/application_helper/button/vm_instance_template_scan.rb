class ApplicationHelper::Button::VmInstanceTemplateScan < ApplicationHelper::Button::SmartStateScan
  needs :@record

  def visible?
    @record.supports_smartstate_analysis? && @record.has_proxy?
  end

  def disabled?
    super
    unless @record.supports_smartstate_analysis? && @record.has_active_proxy?
      @error_message = if !@record.supports_smartstate_analysis?
                         @record.unsupported_reason(:smartstate_analysis)
                       else
                         @record.active_proxy_error_message
                       end
    end
    @error_message.present?
  end
end
