class ApplicationHelper::Button::GenericFeatureButtonWithDisable < ApplicationHelper::Button::GenericFeatureButton
  needs :@record

  def disabled?
    @error_message = @record.unsupported_reason(@feature) unless @record.supports?(@feature)
    @error_message.present?
  end

  def visible?
    true
  end
end
