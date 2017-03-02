class ApplicationHelper::Button::MiqTemplateTimeline < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    unless @record.has_events? || @record.has_events?(:policy_events)
      @error_message = _('No Timeline data has been collected for this Template')
    end
    @error_message.present?
  end
end
