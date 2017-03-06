class ApplicationHelper::Button::EmsStorageTimeline < ApplicationHelper::Button::GenericFeatureButton
  def calculate_properties
    super
    self[:hidden] = true unless visible?
  end

  def disabled?
    unless @record.has_events? || @record.has_events?(:policy_events)
      @error_message = _('No Timeline data has been collected for this Storage Manager')
    end
    @error_message.present?
  end
end
