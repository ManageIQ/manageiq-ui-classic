class ApplicationHelper::Button::PhysicalServerTimeline < ApplicationHelper::Button::Basic
  def calculate_properties
    super
    self[:hidden] = true unless visible?
  end

  def visible?
    @record.supports?(:timeline)
  end

  def disabled?
    unless @record.has_events?
      @error_message = _('No Timeline data has been collected for this Physical Server')
    end
    @error_message.present?
  end
end
