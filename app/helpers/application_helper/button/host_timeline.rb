class ApplicationHelper::Button::HostTimeline < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _("No Timeline data has been collected for this Host") unless @record.has_events? || @record.has_events?(:policy_events)
    @error_message.present?
  end
end
