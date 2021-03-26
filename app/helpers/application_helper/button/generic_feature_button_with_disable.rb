class ApplicationHelper::Button::GenericFeatureButtonWithDisable < ApplicationHelper::Button::GenericFeatureButton
  needs :@record

  def disabled?
    @error_message =
      # Feature supported via SupportsFeatureMixin
      if @record.respond_to?("supports_#{@feature}?")
        @record.unsupported_reason(@feature) unless @record.supports?(@feature)
      else # Feature supported via AvailabilityMixin
        @record.is_available_now_error_message(@feature) unless @record.is_available?(@feature)
      end

    @error_message.present?
  end

  def visible?
    true
  end
end
