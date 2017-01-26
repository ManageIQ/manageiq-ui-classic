class ApplicationHelper::Button::AvailabilityZoneTimeline < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = N_("No Timeline data has been collected for this Availability Zone") unless @record.has_events?
    @error_message.present?
  end
end
